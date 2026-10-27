import { Event, evolve, initial } from "./domain.js";
export class EventStore {
  private streams = new Map<string, Event[]>();
  load(id: string) {
    return (this.streams.get(id) ?? []).reduce(evolve, initial());
  }
  append(id: string, expectedVersion: number, events: Event[]) {
    const stream = this.streams.get(id) ?? [];
    if (stream.length !== expectedVersion)
      throw new Error("optimistic concurrency conflict");
    stream.push(...events);
    this.streams.set(id, stream);
    return this.load(id);
  }
  events(id: string) {
    return [...(this.streams.get(id) ?? [])];
  }
}
