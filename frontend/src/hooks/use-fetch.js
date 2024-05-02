import { useState, useEffect } from 'react';

const useDataFetching = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = await response.json();
                if (isMounted) {
                    const { ok, data, message } = result;
                    if (ok) {
                        setData(data);
                        setLoading(false);
                    } else {
                        setError(message);
                        setLoading(false);
                    }

                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [url]);

    return [data, loading, error];
};

export default useDataFetching;
