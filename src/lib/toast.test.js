import { toast } from "./toast";

describe("toast", () => {
  afterEach(() => {
    toast._clearAll();
  });

  it("notificeert een subscriber met het bericht", () => {
    const listener = jest.fn();
    toast.subscribe(listener);
    toast.show("Link gekopieerd");
    expect(listener).toHaveBeenCalledWith("Link gekopieerd");
  });

  it("notificeert meerdere subscribers", () => {
    const a = jest.fn();
    const b = jest.fn();
    toast.subscribe(a);
    toast.subscribe(b);
    toast.show("Bericht");
    expect(a).toHaveBeenCalledWith("Bericht");
    expect(b).toHaveBeenCalledWith("Bericht");
  });

  it("bereikt een unsubscribed listener niet meer", () => {
    const listener = jest.fn();
    const unsub = toast.subscribe(listener);
    unsub();
    toast.show("Na unsubscribe");
    expect(listener).not.toHaveBeenCalled();
  });
});
