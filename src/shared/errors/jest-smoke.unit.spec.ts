import { describe, expect, it } from "@jest/globals";

import { ErrorCode } from "@/shared/errors";

describe("jest smoke", () => {
  it("resolves the @/ alias and runs under Jest", () => {
    expect(ErrorCode.NOT_FOUND).toBe("NOT_FOUND");
  });
});
