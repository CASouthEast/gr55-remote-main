import {
  RolandGR55AddressMapAbsolute as GR55,
  RolandGR55AddressMap,
} from "../src/lib/roland-gr55/RolandGR55AddressMap";

describe("GK Set 1 Parsing", () => {
  // Real MIDI data from GR-55 GK Set 1 response (02 00 04 00)
  // This is the 80-byte payload (without SysEx wrapper)
  const gkSet1ResponseBytes = new Uint8Array([
    0x20,
    0x20,
    0x20,
    0x20,
    0x20,
    0x20,
    0x20,
    0x20, // 00-07: Name (8 spaces)
    0x00, // 08: PU Type = 0 (GK-3)
    0x0a,
    0x02, // 09-0a: Scale = 0x0a 0x02 (2-byte field)
    0x00, // 0b: PU Phase = 0 (Normal)
    0x00, // 0c: PU Direction = 0 (Normal)
    0x00, // 0d: S1/S2 Position = 0 (Normal)
    0x14, // 0e: Normal PU Gain = 20 (0 dB)
    0x0a, // 0f: Piezo Low = 10
    0x0a, // 10: Piezo High = 10
    0x02,
    0x06,
    0x09,
    0x07,
    0x0b,
    0x0f, // 11-16: String Distance (1-6)
    0x46,
    0x2b,
    0x2b,
    0x32,
    0x28,
    0x0a, // 17-1c: String Sensitivity (1-6)
    0x02, // 1d: Velocity Dynamics = 2
    0x05, // 1e: Velocity Low Cut = 5
    0x05, // 1f: PCM Velocity Sens = 5
    0x05, // 20: Nuance Dynamics = 5
    0x05, // 21: Nuance Trim = 5
    0x00, // 22: Down Tuning = 0
    // Remaining bytes 0x23-0x4f (Bass mode + reserved, not tested)
    ...new Array(77).fill(0x00),
  ]);

  it("should have GK Set 1 definition in address map", () => {
    expect(GR55.system).toBeDefined();
    expect(GR55.system.gkSet1).toBeDefined();
    console.log("GK Set 1 address:", GR55.system.gkSet1.address);
    console.log("GK Set 1 size:", GR55.system.gkSet1.size);
  });

  it("should decode PU Type correctly", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;
    const puTypeBytes = gkSet1ResponseBytes.slice(0x08, 0x09);
    const decoded = gkSet1Struct.puType.type.decode(puTypeBytes, 0, 1);

    console.log("PU Type bytes:", puTypeBytes);
    console.log("PU Type decoded:", decoded);
    console.log(
      "PU Type formatted:",
      gkSet1Struct.puType.type.format?.(decoded) || decoded
    );

    // EnumField.decode() returns the formatted label, not the raw value
    expect(decoded).toBe("GK-3");
  });

  it("should decode Normal PU Gain correctly", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;
    const normalPuGainBytes = gkSet1ResponseBytes.slice(0x0e, 0x0f);
    const decoded = gkSet1Struct.normalPuGain.type.decode(
      normalPuGainBytes,
      0,
      1
    );

    console.log("Normal PU Gain bytes:", normalPuGainBytes);
    console.log("Normal PU Gain decoded:", decoded);
    console.log(
      "Normal PU Gain formatted:",
      gkSet1Struct.normalPuGain.type.format?.(decoded) || decoded
    );

    expect(decoded).toBe(0); // 0 dB (20 - 20 = 0)
  });

  it("should decode String Distances correctly", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;
    // Raw byte values (decoded values 0-100, format function applies ×0.5 to get mm)
    const expectedRawValues = [2, 6, 9, 7, 11, 15]; // raw UByte values

    for (let i = 1; i <= 6; i++) {
      const fieldName = `string${i}Dist` as keyof typeof gkSet1Struct;
      const field = gkSet1Struct[fieldName];
      const offset = 0x11 + (i - 1);
      const bytes = gkSet1ResponseBytes.slice(offset, offset + 1);
      const decoded = field.type.decode(bytes, 0, 1);

      console.log(
        `String ${i} Distance: bytes=${
          bytes[0]
        }, decoded=${decoded}, formatted=${
          field.type.format?.(decoded) || decoded
        }, expected=${expectedRawValues[i - 1]}`
      );

      // decoded value is 0-100 range, format function applies ×0.5 to convert to mm
      expect(decoded).toBe(expectedRawValues[i - 1]);
    }
  });

  it("should decode String Sensitivities correctly", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;
    const expectedSensitivities = [70, 43, 43, 50, 40, 10];

    for (let i = 1; i <= 6; i++) {
      const fieldName = `string${i}Sens` as keyof typeof gkSet1Struct;
      const field = gkSet1Struct[fieldName];
      const offset = 0x17 + (i - 1);
      const bytes = gkSet1ResponseBytes.slice(offset, offset + 1);
      const decoded = field.type.decode(bytes, 0, 1);

      console.log(
        `String ${i} Sensitivity: bytes=${bytes}, decoded=${decoded}, expected=${
          expectedSensitivities[i - 1]
        }`
      );

      expect(decoded).toBe(expectedSensitivities[i - 1]);
    }
  });

  it("should decode Scale field correctly (2-byte field)", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;
    const scaleBytes = gkSet1ResponseBytes.slice(0x09, 0x0b);
    const decoded = gkSet1Struct.scale.type.decode(scaleBytes, 0, 2);

    console.log("Scale bytes:", scaleBytes);
    console.log("Scale decoded:", decoded);
    console.log("Scale size:", gkSet1Struct.scale.size);
    console.log("Scale type:", gkSet1Struct.scale.type.constructor.name);

    // USplit8Field with range 500-660 uses nibble packing, so bytes [0x0a, 0x02]
    // decode as: ((0x0a << 4) | 0x02) & 0xff = 162 in raw 0-255 space
    // The min/max of 500-660 are metadata, not applied by decode()
    expect(decoded).toBe(162);
  });

  it("should decode all new Guitar mode fields", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;

    // Velocity Dynamics (offset 0x1d, byte value 0x02)
    const velDynBytes = gkSet1ResponseBytes.slice(0x1d, 0x1e);
    const velDyn = gkSet1Struct.velocityDynamics.type.decode(velDynBytes, 0, 1);
    console.log("Velocity Dynamics:", velDyn, "expected: 2");
    expect(velDyn).toBe(2);

    // Velocity Low Cut (offset 0x1e, byte value 0x05)
    const velLowCutBytes = gkSet1ResponseBytes.slice(0x1e, 0x1f);
    const velLowCut = gkSet1Struct.velocityLowCut.type.decode(
      velLowCutBytes,
      0,
      1
    );
    console.log("Velocity Low Cut:", velLowCut, "expected: 5");
    expect(velLowCut).toBe(5);

    // PCM Velocity Sens (offset 0x1f, byte value 0x05)
    const pcmVelSensBytes = gkSet1ResponseBytes.slice(0x1f, 0x20);
    const pcmVelSens = gkSet1Struct.pcmVelocitySens.type.decode(
      pcmVelSensBytes,
      0,
      1
    );
    console.log("PCM Velocity Sens:", pcmVelSens, "expected: 5");
    expect(pcmVelSens).toBe(5);

    // Nuance Dynamics (offset 0x20, byte value 0x05)
    const nuanceDynBytes = gkSet1ResponseBytes.slice(0x20, 0x21);
    const nuanceDyn = gkSet1Struct.nuanceDynamics.type.decode(
      nuanceDynBytes,
      0,
      1
    );
    console.log("Nuance Dynamics:", nuanceDyn, "expected: 5");
    expect(nuanceDyn).toBe(5);

    // Nuance Trim (offset 0x21, byte value 0x05)
    const nuanceTrimBytes = gkSet1ResponseBytes.slice(0x21, 0x22);
    const nuanceTrim = gkSet1Struct.nuanceTrim.type.decode(
      nuanceTrimBytes,
      0,
      1
    );
    console.log("Nuance Trim:", nuanceTrim, "expected: 5");
    expect(nuanceTrim).toBe(5);

    // Down Tuning (offset 0x22, byte value 0x00)
    const downTuningBytes = gkSet1ResponseBytes.slice(0x22, 0x23);
    const downTuning = gkSet1Struct.downTuning.type.decode(
      downTuningBytes,
      0,
      1
    );
    console.log("Down Tuning:", downTuning, "expected: 0");
    expect(downTuning).toBe(0);
  });
});
