// Shared cache for user data to prevent flicker during navigation
export const getCachedUser = () => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem("laci_user_cache");
    return cached ? JSON.parse(cached) : null;
};

export const setCachedUser = (user: any) => {
    if (typeof window === "undefined") return;
    if (user) {
        localStorage.setItem("laci_user_cache", JSON.stringify(user));
    } else {
        localStorage.removeItem("laci_user_cache");
    }
};
