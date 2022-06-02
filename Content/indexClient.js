function emptySearchBar() {
    document.getElementById("searchForm").reset();
 }

 function register(user){
     if (user) {
            document.getElementById("Login").style.display = "none";
            document.getElementById("Register").style.display = "none";   
     }
     else {
        document.getElementById("Logout").style.display = "none";
     }
 }