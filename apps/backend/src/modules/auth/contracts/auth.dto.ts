export type LoginRequestDto = {
  email: string;
  password: string;
};

export type RefreshRequestDto = {
  refreshToken: string;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};
