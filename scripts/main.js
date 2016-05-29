var config = {
	apiKey: "AIzaSyCkbkamAptA7hwKjTwbudV2c_z3cDEps3s",
	authDomain: "firechat-948e8.firebaseapp.com",
	databaseURL: "https://firechat-948e8.firebaseio.com",
	storageBucket: "firechat-948e8.appspot.com",
};
firebase.initializeApp(config);

window.addEventListener('load', init);
var mainApp;
function init() {
	mainApp = new Vue({
		el: "#firechat",
		data: {
			user: {},
			messages: [],
			messageText: ""
		},
		ready: function() {
			var that = this;
			checkAuth();

			function checkAuth() {
				firebase.auth().onAuthStateChanged(function(user) {
					if (user) {
						that.user = user;
						/* save user */
						firebase.database().ref('users/' + user.uid).set({
							name: user.displayName,
							photoURL: user.photoURL
						});
					} else {
						signIn();
					}
				});

				firebase.database().ref('groups/main/messages').on('child_added', function(data) {
					var row = data.val();
					row.key = data.key;
					row.user = {photoURL: "", uid: ""};

					that.messages.push(row);
					var inIndex = that.messages.length - 1;
					firebase.database().ref('users/' + row.uid).once('value').then(function(userdata) {
						that.messages[inIndex].user = userdata.val();
					});
				});
			}

			function signIn() {
				var provider = new firebase.auth.GoogleAuthProvider();
				provider.addScope('https://www.googleapis.com/auth/plus.login');

				firebase.auth().signInWithPopup(provider).then(function(result) {
					var token = result.credential.accessToken;
					var user = result.user;

					console.log(token, user);
					checkAuth();
				}).catch(function(error) {
					var errorCode = error.code;
					var errorMessage = error.message;
					var email = error.email;
					var credential = error.credential;

					console.warn(errorCode, errorMessage, email, credential);
				});
			}
		},
		methods: {
			sendMessage: function() {
				if (this.messageText !== "") {
					/* simpan pesan ke database */
					firebase.database().ref('groups/main/messages').push({
						uid: this.user.uid,
						text: this.messageText
					});

					console.log("send message : `" + this.messageText + "`");
					this.messageText = "";
				} else {
					alert("Pesan tidak boleh kosong");
				}
			}
		}
	});
}