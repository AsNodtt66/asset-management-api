import axios from "axios";

export async function login(data: any) {
    const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        data
    );

    return res.data;
}