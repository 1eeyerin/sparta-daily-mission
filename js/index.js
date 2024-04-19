// Firebase SDK 라이브러리 가져오기
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {getDocs} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getFirestore, collection, addDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZi7Fcw5fL6tNDrWt6-KMzBP5ilG_RcCc",
  authDomain: "sparta-cebef.firebaseapp.com",
  projectId: "sparta-cebef",
  storageBucket: "sparta-cebef.appspot.com",
  messagingSenderId: "1074337337813",
  appId: "1:1074337337813:web:594d2d38a603efb3716d5c",
  measurementId: "G-P24X14328Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

$("#postingbtn").click(async function() {
  const title = $('#title').val();
  const content = $('#content').val();
  const password = $('#password').val();

  if (!title || !content || !password) {
    alert('모든 칸을 작성해주세요');
    return;
  }

  const file = document.querySelector('#formFile').files[0];
  if (!file) {
    alert('파일이 선택되지 않았습니다.');
    return;
  }

  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > 1) {
    alert('파일 용량이 초과되어 업로드가 실패되었습니다. (1MB 이내)');
    return;
  }
  const imageRef = ref(storage, 'images/' + Math.floor(+new Date() / 1000));

  const pw = await getDocs(collection(db, "pw"));

  let pw1;
  pw.forEach((doc) => {
    pw1 = doc.data().pw;
  });

  if (pw1 !== password) {
    alert('비밀번호가 일치하지 않으니 다시 시도해주세요.')
    return false;
  }

  try {
    await uploadBytes(imageRef, file);
    const image = await getDownloadURL(imageRef);
    const date = new Date();

    await addDoc(collection(db, "albums"), {
      image,
      title,
      content,
      date
    });

    alert('저장 완료!');
    window.location.reload();
  } catch (error) {
    alert('저장 에러');
    window.error('이미지 업로드 에러:', error);
  }
});

$(".popupBtn").click(function() {
  $('#popupLayer').toggle();
});


let url = "http://openapi.seoul.go.kr:8088/6d4d776b466c656533356a4b4b5872/json/RealtimeCityAir/1/99";
fetch(url).then(res => res.json()).then(data => {
  const korText = data['RealtimeCityAir']['row'][0]['IDEX_NM'];
  const level = data['RealtimeCityAir']['row'][0]['IDEX_MVL'];
  alert(`현재 서울의 미세먼지는 ${level}, ${korText}입니다.`);
  $('#msg').text(korText);
});

const docs = await getDocs(query(collection(db, "albums"), orderBy("date", "desc")));
docs.forEach((doc) => {
  const row = doc.data();
  const date = row.date.toDate();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  const temp_html = `
  <div class="col">
      <div class="card h-100">
          <img src="${row.image}"
              class="card-img-top" alt="...">
          <div class="card-body">
              <h5 class="card-title">${row.title}</h5>
              <p class="card-text">${row.content}</p>
          </div>
          <div class="card-footer">
              <small class="text-body-secondary">${formattedDate}</small>
          </div>
      </div>
  </div>`;
  $('#card').append(temp_html);
});