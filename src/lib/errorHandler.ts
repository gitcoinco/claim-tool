import type { Toast } from '@/hooks/useToast';
import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from 'viem';

export function handleTransactionError(
  error: BaseError,
  toast: (props: Toast) => void,
) {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (err) =>
        err instanceof ContractFunctionRevertedError ||
        err instanceof UserRejectedRequestError ||
        err instanceof ContractFunctionExecutionError ||
        err instanceof InsufficientFundsError,
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? '';
      const revertReason =
        revertError.message
          .split('reverted with the following reason:')[1]
          ?.trim() ?? errorName;
      toast({
        title: 'Transaction Failed',
        description: revertReason,
        variant: 'destructive',
      });
      return;
    }
    if (revertError instanceof UserRejectedRequestError) {
      toast({
        title: 'Transaction Failed',
        description: 'User rejected the transaction',
        variant: 'destructive',
      });
      return;
    }
    if (revertError instanceof ContractFunctionExecutionError) {
      const errorName = revertError.cause?.shortMessage ?? '';
      const revertReason = errorName;
      toast({
        title: 'Transaction Failed',
        description: revertReason,
        variant: 'destructive',
      });
      console.error(revertError);
      return;
    }
    if (error instanceof InsufficientFundsError) {
      toast({
        title: 'Transaction Failed',
        description: 'Insufficient funds',
        variant: 'destructive',
      });
    }
    toast({
      title: 'Transaction Failed',
      description: 'An unknown error occurred',
      variant: 'destructive',
    });
  }
  return;
}
