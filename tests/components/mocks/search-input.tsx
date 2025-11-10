
import React from 'react';

const SearchInput = ({
    value,
    onChange,
    setSelectedMedia,
    setMediaTitle,
}) => {
    const handleChange = (e) => {
        onChange(e);
        setMediaTitle(e.target.value);
        if (e.target.value === 'The Matrix') {
            setSelectedMedia({
                id: 1,
                title: 'The Matrix',
                poster: '',
            });
        }
    };

    return <input value={value} onChange={handleChange} />;
};

export default SearchInput;
