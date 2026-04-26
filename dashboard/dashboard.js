async function selectBook(bookKey) {
    if (bookKey === 'noli') {
        window.location.href = window.BASE_URL + 'chapters/chapters.html?book=noli';
    } else {
        alert("Ang 'El Filibusterismo' ay paparating pa lamang. Manatiling nakasubaybay!");
    }
}

function startReading(chapterNum) {
    window.location.href = window.BASE_URL + `reader/reader.html?book=noli&chapter=${chapterNum}`;
}
