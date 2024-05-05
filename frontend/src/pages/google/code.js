import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { configs } from "src/config-variables";
import { useBearStore } from "src/contexts/store";

const Page = () => {
    const router = useRouter();
    const [render, setRender] = useState("");
    const { login, user } = useBearStore();

    useEffect(() => {
        const { code } = router.query;

        setRender("Validating...");
        if (code) {
            console.log({ code });
            fetch(`${configs.baseUrl}/calender/authorize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, id: user._id }),
            })
                .then((res) => res.json())
                .then((res) => {
                    const { ok, data, message } = res;
                    setRender(message);
                    if (ok) {
                        setRender("Setting up stuff");
                        login(data.user, data.token);
                        router.push('/');
                    } else {
                        setRender(message);
                        // router.push('/'); // route guard will catch this
                    }
                })
                .catch((error) => {
                    console.error("Error during fetch:", error);
                    setRender("An error occurred while processing the token.");
                });
        } else {
            setRender("oauth code not found");
            // setTimeout(() => {
            //     router.push("/auth/login");
            // }, 3000);
        }
    }, [router.query, login]);

    return <div>{render}</div>;
};

export default Page;