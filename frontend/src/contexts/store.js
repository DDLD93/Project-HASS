import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

export const useBearStore = create(
    persist(
        (set, get) => ({
            user: false,
            token: null,
            notifications:[
                {name:"Just test",time:"12/12/2025 10:00:00"}
            ],
            pushNotification: (notification) =>
            set(() => {
                return notifications.push(notification);
            }),
            login: (user, token) =>
                set(() => {
                    return {
                        user: user,
                        token: token
                    };
                }),
            logout: () =>
                set(() => {
                    localStorage.clear()
                    return {
                        user: null,
                        token: null
                    };
                }),
        }),
        {
            name: 'hass_user',
            storage: createJSONStorage(() => localStorage), 
        }
    )
)