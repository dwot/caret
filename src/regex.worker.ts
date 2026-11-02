import { run, type RunRequest } from "./regex";

// Runs in its own thread: a pattern that never finishes can only freeze this, and Matcher replaces it.
self.onmessage = ({ data }: MessageEvent<{ id: number; request: RunRequest }>) => {
  self.postMessage({ id: data.id, result: run(data.request) });
};
self.postMessage({ ready: true });
