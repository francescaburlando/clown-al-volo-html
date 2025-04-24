const firebaseConfig = {
  apiKey: 'AIzaSyC4gaoeDF4Gg0FZUF93VCcCioDCi-T9eSQ',
  appId: '1:647995025759:web:785603fc2fb0213ee06eea',
  messagingSenderId: '647995025759',
  projectId: 'clownalvolo-6b6e7',
  authDomain: 'clownalvolo-6b6e7.firebaseapp.com',
  databaseURL: 'https://clownalvolo-6b6e7-default-rtdb.europe-west1.firebasedatabase.app',
  storageBucket: 'clownalvolo-6b6e7.appspot.com'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
