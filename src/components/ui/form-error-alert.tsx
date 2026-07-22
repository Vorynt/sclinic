import { WarningCircleIcon } from "@phosphor-icons/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type FormErrorAlertProps = {
  message: string;
  code: string;
  className?: string;
};

function FormErrorAlert({ message, code, className }: FormErrorAlertProps) {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <WarningCircleIcon className="size-5" />
      <AlertTitle>{message}</AlertTitle>
      <AlertDescription>
        <span className="font-mono text-xs tracking-wide">{code}</span>
      </AlertDescription>
    </Alert>
  );
}

export { FormErrorAlert };
