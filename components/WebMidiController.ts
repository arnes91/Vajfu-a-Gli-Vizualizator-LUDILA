// Web MIDI API Controller for BRZI_STUDIO VJ Agent
// Handles external hardware controllers (Launchpads, MPK keyboards, DJ faders, knobs)
// and maps CC sliders and Note triggers to visualizer glitch suites and sensitivity sliders.

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
}

export interface MidiEventRecord {
  timestamp: number;
  type: 'noteon' | 'noteoff' | 'cc' | 'pitch' | 'other';
  channel: number;
  noteOrCC: number;
  value: number;
  description: string;
}

export type MidiControlCallback = (cc: number, value: number, normalized: number) => void;
export type MidiTriggerCallback = (note: number, velocity: number) => void;
export type MidiStatusCallback = (connected: boolean, deviceName: string, devices: MidiDevice[]) => void;

export class WebMidiController {
  private midiAccess: any = null;
  private isSupported: boolean = false;
  private isConnected: boolean = false;
  private activeDeviceName: string = 'No Device Connected';
  private devices: MidiDevice[] = [];
  private lastEvent: MidiEventRecord | null = null;

  private onControlChange?: MidiControlCallback;
  private onNoteTrigger?: MidiTriggerCallback;
  private onStatusChange?: MidiStatusCallback;
  private onEventLog?: (event: MidiEventRecord) => void;

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async init(
    onControlChange: MidiControlCallback,
    onNoteTrigger: MidiTriggerCallback,
    onStatusChange?: MidiStatusCallback,
    onEventLog?: (event: MidiEventRecord) => void
  ): Promise<boolean> {
    this.onControlChange = onControlChange;
    this.onNoteTrigger = onNoteTrigger;
    this.onStatusChange = onStatusChange;
    this.onEventLog = onEventLog;

    if (!this.isSupported) {
      console.warn('Web MIDI API is not natively supported in this browser.');
      this.updateStatus(false, 'Unsupported');
      return false;
    }

    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.setupMidiInputs();

      this.midiAccess.onstatechange = () => {
        this.setupMidiInputs();
      };

      return true;
    } catch (err) {
      console.warn('Web MIDI access request failed or was dismissed:', err);
      this.updateStatus(false, 'Permission Denied / Inactive');
      return false;
    }
  }

  private setupMidiInputs() {
    if (!this.midiAccess) return;

    const inputs = this.midiAccess.inputs.values();
    const deviceList: MidiDevice[] = [];
    let count = 0;

    for (const input of inputs) {
      count++;
      deviceList.push({
        id: input.id,
        name: input.name || `MIDI Input ${count}`,
        manufacturer: input.manufacturer || 'Generic',
        state: input.state || 'connected',
      });

      // Bind listener
      input.onmidimessage = (event: any) => this.handleMidiMessage(event);
    }

    this.devices = deviceList;
    const connected = deviceList.length > 0;
    const deviceName = connected
      ? deviceList.map((d) => d.name).join(', ')
      : 'Listening for Hardware Controller...';

    this.updateStatus(connected, deviceName);
  }

  private handleMidiMessage(event: any) {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const messageType = status >> 4;
    const channel = (status & 0xf) + 1;
    const byte1 = data[1];
    const byte2 = data.length > 2 ? data[2] : 0;

    let eventRecord: MidiEventRecord | null = null;

    // 0x9 = Note On
    if (messageType === 9 && byte2 > 0) {
      const note = byte1;
      const velocity = byte2;

      eventRecord = {
        timestamp: Date.now(),
        type: 'noteon',
        channel,
        noteOrCC: note,
        value: velocity,
        description: `Note On ${this.getNoteName(note)} (${note}) Vel: ${velocity}`,
      };

      if (this.onNoteTrigger) {
        this.onNoteTrigger(note, velocity);
      }
    }
    // 0x8 = Note Off
    else if (messageType === 8 || (messageType === 9 && byte2 === 0)) {
      eventRecord = {
        timestamp: Date.now(),
        type: 'noteoff',
        channel,
        noteOrCC: byte1,
        value: 0,
        description: `Note Off ${this.getNoteName(byte1)} (${byte1})`,
      };
    }
    // 0xB = Control Change (CC)
    else if (messageType === 11) {
      const cc = byte1;
      const value = byte2;
      const normalized = value / 127.0; // 0.0 to 1.0

      eventRecord = {
        timestamp: Date.now(),
        type: 'cc',
        channel,
        noteOrCC: cc,
        value,
        description: `CC ${cc} Val: ${value} (${(normalized * 100).toFixed(0)}%)`,
      };

      if (this.onControlChange) {
        this.onControlChange(cc, value, normalized);
      }
    }

    if (eventRecord) {
      this.lastEvent = eventRecord;
      if (this.onEventLog) {
        this.onEventLog(eventRecord);
      }
    }
  }

  private getNoteName(noteNumber: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = notes[noteNumber % 12];
    return `${note}${octave}`;
  }

  private updateStatus(connected: boolean, deviceName: string) {
    this.isConnected = connected;
    this.activeDeviceName = deviceName;
    if (this.onStatusChange) {
      this.onStatusChange(connected, deviceName, this.devices);
    }
  }

  // Virtual MIDI simulation for direct UI triggers & previewing without physical hardware
  public triggerVirtualNote(note: number, velocity: number = 127) {
    const eventRecord: MidiEventRecord = {
      timestamp: Date.now(),
      type: 'noteon',
      channel: 1,
      noteOrCC: note,
      value: velocity,
      description: `[VIRTUAL] Note On ${this.getNoteName(note)} (${note}) Vel: ${velocity}`,
    };
    this.lastEvent = eventRecord;
    if (this.onEventLog) this.onEventLog(eventRecord);
    if (this.onNoteTrigger) this.onNoteTrigger(note, velocity);
  }

  public triggerVirtualCC(cc: number, value: number) {
    const normalized = Math.max(0, Math.min(1, value / 127.0));
    const eventRecord: MidiEventRecord = {
      timestamp: Date.now(),
      type: 'cc',
      channel: 1,
      noteOrCC: cc,
      value,
      description: `[VIRTUAL] CC ${cc} Val: ${value} (${(normalized * 100).toFixed(0)}%)`,
    };
    this.lastEvent = eventRecord;
    if (this.onEventLog) this.onEventLog(eventRecord);
    if (this.onControlChange) this.onControlChange(cc, value, normalized);
  }

  public getDevices(): MidiDevice[] {
    return this.devices;
  }

  public getLastEvent(): MidiEventRecord | null {
    return this.lastEvent;
  }

  public getStatus() {
    return {
      isSupported: this.isSupported,
      isConnected: this.isConnected,
      activeDeviceName: this.activeDeviceName,
      deviceCount: this.devices.length,
      lastEvent: this.lastEvent,
    };
  }
}
