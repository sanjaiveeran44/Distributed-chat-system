import axios from "axios";

const API = "http://localhost:8080/api/rooms";

const getToken = () => {

    return localStorage.getItem("token");

};

export const getRooms = async () => {

    return axios.get(API, {

        headers: {

            Authorization: `Bearer ${getToken()}`

        }

    });

};

export const createRoom = async (room) => {

    return axios.post(

        API,

        room,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

};

export const joinRoom = async (roomId) => {

    return axios.post(

        `${API}/${roomId}/join`,

        {},

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

};

export const getRoomMessages = async (roomId) => {

    return axios.get(

        `${API}/${roomId}/messages`,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

};