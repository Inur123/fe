"use client";

import { useLayoutEffect } from "react";

export function AuthInit() {
    useLayoutEffect(() => {
        try {
            const role = localStorage.getItem('laci_role');
            const perms = localStorage.getItem('laci_perms');
            
            if (role) {
                document.documentElement.setAttribute('data-role', role);
            }
            
            if (perms) {
                const p = JSON.parse(perms);
                if (p.includes('get_roles')) document.documentElement.setAttribute('data-perm-roles', 'true');
                if (p.includes('get_periods')) document.documentElement.setAttribute('data-perm-periods', 'true');
                if (p.includes('get_users')) document.documentElement.setAttribute('data-perm-users', 'true');
            }
        } catch (e) {
            console.error("AuthInit error:", e);
        }
    }, []);

    return null;
}
