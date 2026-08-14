import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp";
import { Label } from "./label";

function SixDigitOtp({
  disabled,
  invalid,
  id,
}: {
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
}) {
  const invalidAttr = invalid || undefined;

  return (
    <InputOTP
      id={id}
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      disabled={disabled}
      aria-invalid={invalidAttr}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} aria-invalid={invalidAttr} />
        <InputOTPSlot index={1} aria-invalid={invalidAttr} />
        <InputOTPSlot index={2} aria-invalid={invalidAttr} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} aria-invalid={invalidAttr} />
        <InputOTPSlot index={4} aria-invalid={invalidAttr} />
        <InputOTPSlot index={5} aria-invalid={invalidAttr} />
      </InputOTPGroup>
    </InputOTP>
  );
}

const meta = {
  title: "Atoms/Input OTP",
  component: SixDigitOtp,
  tags: ["autodocs"],
} satisfies Meta<typeof SixDigitOtp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "OTP de 6 dígitos no padrão visual do Input (altura, radius, tokens).",
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story: "Campo indisponível para edição.",
      },
    },
  },
};

export const Invalid: Story = {
  args: { invalid: true },
  parameters: {
    docs: {
      description: {
        story: "Estado de erro via aria-invalid, alinhado ao Input.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="otp-with-label">Código do autenticador</Label>
      <SixDigitOtp id="otp-with-label" {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Composição com Label associado via htmlFor e id.",
      },
    },
  },
};
