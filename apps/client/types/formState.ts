export type SignFormState =
  | {
      data: {
        userName?: string;
        email?: string;
        password?: string;
      };
      errors?: {
        userName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
