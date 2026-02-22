export type LoginRequestDto = {
  email: string;
  password: string;
};

export type RegisterRequestDto = {
  email: string;
  password: string;
  roles?: string[];
};

export type RefreshRequestDto = {
  refreshToken: string;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};
