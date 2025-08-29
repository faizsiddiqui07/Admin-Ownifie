import axios from "axios"

const uploadImage = async (image) => {

    if (!image) {
        throw new Error("Image file is required for upload.");
    }
    
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "OWNiFiE"); 
    
    try {
        const dataResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/daf8kxmia/image/upload`,
            formData,
            { 
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return dataResponse.data;
    } catch (error) {
        console.error("Error uploading image:", error.response?.data || error.message);
    }
}

export default uploadImage