export interface UserData {
    full_name: string;
    email: string;
    company_name: string | null;
    id?: number | null;
    password?: string;
}

export interface AuthToken {
    token: string;
}

export type LoginUser = Pick<
    UserData,
    "id" | "full_name" | "email" | "company_name"
> & AuthToken;

export interface OnboardingData {
    company_name: string,
}

export type LoginResponse = {
    message: string;
    data: {
        user: LoginUser;
    };
};