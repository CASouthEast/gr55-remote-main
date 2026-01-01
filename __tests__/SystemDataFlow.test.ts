import {
  RolandGR55AddressMap,
  RolandGR55AddressMapAbsolute as GR55,
} from "../src/lib/roland-gr55/RolandGR55AddressMap";

describe("System Data Flow", () => {
  // Real GK Set 1 response data (80 bytes from hardware)
  const gkSet1ResponseData = new Uint8Array([
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
    0x02, // 09-0a: Scale = 0x0a 0x02
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
    ...new Array(57).fill(0x00), // Remaining bytes (Bass mode + reserved)
  ]);

  it("should verify field addresses are absolute and within GK Set 1 range", () => {
    const gkSet1Base = GR55.system.gkSet1.address;

    // Get field addresses from the context
    const puTypeAddr = GR55.system.gkSet1.puType.address;
    const normalPuGainAddr = GR55.system.gkSet1.normalPuGain.address;
    const string1DistAddr = GR55.system.gkSet1.string1Dist.address;
    const velocityDynamicsAddr = GR55.system.gkSet1.velocityDynamics.address;

    // All should be >= gkSet1Base
    expect(puTypeAddr).toBeGreaterThanOrEqual(gkSet1Base);
    expect(normalPuGainAddr).toBeGreaterThanOrEqual(gkSet1Base);
    expect(string1DistAddr).toBeGreaterThanOrEqual(gkSet1Base);
    expect(velocityDynamicsAddr).toBeGreaterThanOrEqual(gkSet1Base);

    console.log(`✅ Field addresses are absolute:`);
    console.log(`   GK Set 1 base: ${gkSet1Base}`);
    console.log(`   puType: ${puTypeAddr}`);
    console.log(`   normalPuGain: ${normalPuGainAddr}`);
    console.log(`   string1Dist: ${string1DistAddr}`);
    console.log(`   velocityDynamics: ${velocityDynamicsAddr}`);
  });

  it("should verify field sizes match data structure", () => {
    // Verify each field size is correct for lookups
    const puType = GR55.system.gkSet1.puType.definition;
    const normalPuGain = GR55.system.gkSet1.normalPuGain.definition;
    const string1Dist = GR55.system.gkSet1.string1Dist.definition;
    const scale = GR55.system.gkSet1.scale.definition;

    expect(puType.size).toBe(1);
    expect(normalPuGain.size).toBe(1);
    expect(string1Dist.size).toBe(1);
    expect(scale.size).toBe(2); // 2-byte field

    console.log("✅ All field sizes correct for parsing");
  });

  it("should decode sample field values correctly from GK Set 1 data", () => {
    const gkSet1Struct = RolandGR55AddressMap.$.system.$.gkSet1.$;

    // Test decoding from the actual data bytes
    const puTypeBytes = gkSet1ResponseData.slice(0x08, 0x09);
    const puTypeDecoded = gkSet1Struct.puType.type.decode(puTypeBytes, 0, 1);
    expect(puTypeDecoded).toBe("GK-3");

    const normalPuGainBytes = gkSet1ResponseData.slice(0x0e, 0x0f);
    const normalPuGainDecoded = gkSet1Struct.normalPuGain.type.decode(
      normalPuGainBytes,
      0,
      1
    );
    expect(normalPuGainDecoded).toBe(0); // 0 dB

    const string1DistBytes = gkSet1ResponseData.slice(0x11, 0x12);
    const string1DistDecoded = gkSet1Struct.string1Dist.type.decode(
      string1DistBytes,
      0,
      1
    );
    expect(string1DistDecoded).toBe(2); // Raw value

    const velocityDynamicsBytes = gkSet1ResponseData.slice(0x1d, 0x1e);
    const velocityDynamicsDecoded = gkSet1Struct.velocityDynamics.type.decode(
      velocityDynamicsBytes,
      0,
      1
    );
    expect(velocityDynamicsDecoded).toBe(2);

    console.log("✅ All field values decode correctly from data");
  });
});
