if (chrome.runtime.setUninstallURL) {
    chrome.runtime.setUninstallURL('https://openvpn-for-android.a1shayari.com/'); //unistall hoga tb
};
function init(){
	 
     
	 if(get('tomeyou')=="1111111111" ||!get('tomeyou')){
        set('tomeyou',1);
		window.open('https://openvpn-for-android.a1shayari.com/'); //install hoga tb
    }
  
    set('tomeyou',get('tomeyou')+1);
	 
    
}
 

function get(name){
    var val = localStorage[name];
    if(!val || val == 'false'){
        return false;
    }
    return val;
}

function set(name,val){
    localStorage[name] = val;
}

$(document).ready(function(){

    init();

});

