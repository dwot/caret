import type { RunRequest, RunResult } from "./regex";

/** How long one pattern gets. Some patterns take longer than the age of the universe on a short line. */
const TIME_LIMIT = 500;

export type MatchResult = RunResult | { kind: "timeout" } | { kind: "superseded" };

interface Job {
  request: RunRequest;
  resolve: (result: MatchResult) => void;
}

/** Runs patterns in a worker, one at a time, keeping only the newest one waiting. */
export class Matcher {
  private worker!: Worker;
  private ready = false;
  private running?: Job & { id: number; timer: number };
  private waiting?: Job;
  private nextId = 0;

  constructor() {
    this.spawn();
  }

  run(request: RunRequest): Promise<MatchResult> {
    return new Promise((resolve) => {
      this.waiting?.resolve({ kind: "superseded" });
      this.waiting = { request, resolve };
      this.advance();
    });
  }

  private spawn() {
    this.ready = false;
    this.worker = new Worker(new URL("./regex.worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = ({ data }) => {
      if (data.ready) {
        this.ready = true;
        this.advance();
      } else if (data.id === this.running?.id) {
        this.finish(data.result);
      }
    };
  }

  private advance() {
    if (!this.ready || this.running || !this.waiting) return;
    const { request, resolve } = this.waiting;
    this.waiting = undefined;
    const id = this.nextId++;
    const timer = window.setTimeout(() => {
      // A thread stuck in a regex can't be interrupted, only replaced.
      this.worker.terminate();
      this.spawn();
      this.finish({ kind: "timeout" });
    }, TIME_LIMIT);
    this.running = { id, timer, request, resolve };
    this.worker.postMessage({ id, request });
  }

  private finish(result: MatchResult) {
    const job = this.running!;
    this.running = undefined;
    clearTimeout(job.timer);
    job.resolve(result);
    this.advance();
  }
}
