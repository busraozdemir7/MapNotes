import { detecType, setStorage, detecIcon } from "./helpers.js";

//! HTML'den gelenler 
const form = document.querySelector("form");
const list = document.querySelector("ul");
console.log(list);

//! Olay izleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);


//! Ortak Kullanım Alanı 
var map;
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];
var layerGroup = [];

navigator.geolocation.getCurrentPosition(loadMap, console.log("Kullanıcı kabul etmedi"));

// Haritaya tıklanınca çalışır
function onMapClick(e) {
    form.style.display = "flex";
    coords = [e.latlng.lat, e.latlng.lng];
    // console.log(coords);
}

// Kullanıcının konumuna göre ekrana haritayı getirme
function loadMap(e) {
    // console.log(e);
    // Haritanın kurulumu
    map = new L.map('map').setView([e.coords.latitude, e.coords.longitude], 10);
    L.control;
    // Haritanın nasıl gözükeceğini belirler 
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    // haritada ekrana basılacak imleçleri tutacağımız katman
    layerGroup = L.layerGroup().addTo(map);

    // local den gelen notları harita geldiğinde ekrana render lama
    renderNoteList(notes);

    // Haritada bir tıklanma olduğunda çalışacak fonksiyon
    map.on("click", onMapClick);
}

function renderMarker(item) {
    // marker ı oluşturur
    L.marker(item.coords, { icon: detecIcon(item.status) })
        // imleçlerin olduğu katmanı ekler    
        .addTo(layerGroup)
        // üzerine tıklanınca açılacak popup yapısını ekleme
        .bindPopup(`${item.desc}`);
}

// formun gönderilme olayında çalışır
function handleSubmit(e) {
    e.preventDefault();
    console.log(e);

    const desc = e.target[0].value;
    if (!desc) return;
    const date = e.target[1].value;
    const status = e.target[2].value;
    // notes dizisine eleman ekleme
    notes.push({ id: new Date().getTime(), desc, date, status, coords });
    console.log(notes);
    // local storage güncelleme
    setStorage(notes);
    // renderNoteList fonksiyonuna notes dizisine gönderdik
    renderNoteList(notes);
    // formu kapatma
    form.style.display = "none";
}

// ekrana notları basma
function renderNoteList(item) {
    // notlar alanını temizler
    list.innerHTML = "";
    // markaları temizleme
    layerGroup.clearLayers();
    // her bir not için diziyi dönüp notları aktarma
    item.forEach((item) => {
        console.log(item);
        const listElement = document.createElement("li");
        // datasına sahip olduğu id'yi ekleme
        listElement.dataset.id = item.id;
        listElement;
        listElement.innerHTML = `
        <div>
                        <p>${item.desc}</p>
                        <p><span>Tarih:</span>${item.date}</p>
                        <p><span>Durum:</span>${detecType(item.status)}</p>

                        <i class="bi bi-x" id="delete"></i>
                        <i class="bi bi-airplane-fill" id="fly"></i>
        </div>
        `;
        list.insertAdjacentElement("afterbegin", listElement);
        renderMarker(item);
    });
}

function handleClick(e) {
    // güncellenecek elemanın id'sini öğrenme
    const id = e.target.parentElement.parentElement.dataset.id;

    if (e.target.id === "delete") {
        console.log(notes);
        // id'sini bildiğimiz elemanı diziden kaldırma
        notes = notes.filter((note) => note.id != id);
        // local i güncelle
        setStorage(notes);
        // ekran güncelleme
        renderNoteList(notes);
    }
    if (e.target.id === "fly") {
        const note = notes.find((note) => note.id == id);
        console.log(note);
        map.flyTo(note.coords);
    }
}