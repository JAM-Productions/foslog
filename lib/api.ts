// Gets a list of media items based on type and title
export const getMediaByTitle = async (
    mediatype: string,
    mediatitle: string
) => {
    const response = await fetch(
        `http://localhost:3000/api/search?mediatype=${encodeURIComponent(mediatype)}&mediatitle=${encodeURIComponent(mediatitle)}`
    );
    const data = await response.json();
    return data;
};
