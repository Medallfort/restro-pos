import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useLiveUpdates, { EVENT_KEYS } from "./useLiveUpdates";

// EventSource ma kaynch f jsdom: kan-simuliw wa7ed sghir
class FakeEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = FakeEventSource.CONNECTING;
    this.closed = false;
    FakeEventSource.instances.push(this);
  }

  open() {
    this.readyState = FakeEventSource.OPEN;
    this.onopen?.();
  }

  emit(type) {
    this.onmessage?.({ data: JSON.stringify({ type }) });
  }

  fail({ closed }) {
    this.readyState = closed ? FakeEventSource.CLOSED : FakeEventSource.CONNECTING;
    this.onerror?.();
  }

  close() {
    this.closed = true;
    this.readyState = FakeEventSource.CLOSED;
  }
}

const latest = () => FakeEventSource.instances.at(-1);

function setup(enabled = true) {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(({ on }) => useLiveUpdates(on), { wrapper, initialProps: { on: enabled } });
  const invalidatedKeys = () => invalidate.mock.calls.map(([{ queryKey }]) => queryKey);
  return { ...hook, invalidate, invalidatedKeys };
}

describe("useLiveUpdates", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("does not connect when logged out", () => {
    setup(false);
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  test("an orders event refreshes orders, tables and stats", () => {
    const { invalidatedKeys } = setup();
    expect(latest().url).toBe("/api/events");

    act(() => {
      latest().open();
      latest().emit("orders");
    });
    expect(invalidatedKeys()).toEqual(EVENT_KEYS.orders);
    expect(invalidatedKeys()).toContainEqual(["tables"]);
  });

  test("a menu event only refreshes menu queries; unknown events are ignored", () => {
    const { invalidatedKeys } = setup();
    act(() => {
      latest().open();
      latest().emit("menu");
      latest().emit("something-else");
      latest().onmessage({ data: "not json" });
    });
    expect(invalidatedKeys()).toEqual(EVENT_KEYS.menu);
  });

  test("after a reconnection everything is refreshed (events may have been missed)", () => {
    const { invalidate } = setup();
    act(() => latest().open());
    expect(invalidate).not.toHaveBeenCalled();

    act(() => {
      latest().fail({ closed: false }); // EventSource kay3awd bo7do
      latest().open();
    });
    expect(invalidate).toHaveBeenCalledTimes(Object.values(EVENT_KEYS).flat().length);
  });

  test("retries after 30s when the server closes the stream (e.g. 401)", () => {
    setup();
    act(() => latest().fail({ closed: true }));
    expect(FakeEventSource.instances).toHaveLength(1);

    act(() => vi.advanceTimersByTime(30000));
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  test("closes the stream on logout / unmount", () => {
    const { rerender } = setup();
    const source = latest();
    rerender({ on: false });
    expect(source.closed).toBe(true);
  });
});
