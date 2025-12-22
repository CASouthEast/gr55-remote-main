// Mock for @CASouthEast/react-native-midi - provides stub MIDI API for tests
export class MockMIDIInput {
  id = "mock-input";
  name = "Mock MIDI Input";
  type = "input" as const;
  state = "connected" as const;
  connection = "open" as const;
  onmidimessage: ((event: MIDIMessageEvent) => void) | null = null;

  open(): Promise<MIDIInput> {
    return Promise.resolve(this as any);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

export class MockMIDIOutput {
  id = "mock-output";
  name = "Mock MIDI Output";
  type = "output" as const;
  state = "connected" as const;
  connection = "open" as const;

  send(data: Uint8Array, timestamp?: number): void {
    // Mock implementation - does nothing
  }

  clear(): void {
    // Mock implementation - does nothing
  }

  open(): Promise<MIDIOutput> {
    return Promise.resolve(this as any);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

export class MockMIDIAccess {
  inputs = new Map<string, MIDIInput>();
  outputs = new Map<string, MIDIOutput>();
  onconnectionchange: ((event: MIDIConnectionEvent) => void) | null = null;
}

export async function requestMIDIAccess(): Promise<MIDIAccess> {
  const access = new MockMIDIAccess();
  access.inputs.set("mock-input", new MockMIDIInput() as any);
  access.outputs.set("mock-output", new MockMIDIOutput() as any);
  return access as any;
}

export { requestMIDIAccess as default };
