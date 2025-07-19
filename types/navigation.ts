import { TransferType } from '../screens/TransferSelectionScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  AdminCategories: undefined;
  MyProducts: undefined;
  MyProductDetail: { productId: string };
  EditProduct: { productId: string };
  Wallet: undefined;
  EditProfile: undefined;
  MyAnnouncements: undefined;
  Transactions: undefined;
  Orders: undefined;
  EmailSettings: undefined;
  PaymentMethods: undefined;
  NotificationSettings: undefined;
  BulkDiscount: undefined;
  TransferSelection: undefined;
  TransferAmount: { transferType: TransferType };
  TransferConfirmation: {
    transferType: TransferType;
    amount: number;
    fee: number;
    totalAmount: number;
  };
  TransferSuccess: {
    transferType: TransferType;
    amount: number;
    fee: number;
    totalAmount: number;
    transactionId: string;
  };
}; 