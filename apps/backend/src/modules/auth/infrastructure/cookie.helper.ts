import type { Response } from 'express';

const ACCESS_TTL_DEFAULT = 15 * 60;
const REFRESH_TTL_DEFAULT = 7 * 24 * 60 * 60;

const parseTtlSeconds = (
    value: string | undefined,
    fallbackSeconds: number,
): number => {
    if (!value) return fallbackSeconds;

    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return fallbackSeconds;

    const amount = Number.parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 24 * 60 * 60,
    };

    return amount * (multipliers[unit] ?? 1);
};

const isProduction = () => process.env.NODE_ENV === 'production';

export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
): void {
    const accessMaxAge =
        parseTtlSeconds(process.env.JWT_ACCESS_TTL, ACCESS_TTL_DEFAULT) * 1000;

    const refreshMaxAge =
        parseTtlSeconds(process.env.JWT_REFRESH_TTL, REFRESH_TTL_DEFAULT) * 1000;

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        path: '/',
        maxAge: accessMaxAge,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: refreshMaxAge,
    });
}

export function clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        path: '/',
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction(),
        sameSite: 'strict',
        path: '/api/auth',
    });
}
