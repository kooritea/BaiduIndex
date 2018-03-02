var ip
$.get('http://danmu.fm/api/hosts',function(host){
	ip=''+host.cmcc.match(/[\d\.]+/);
})

document.getElementById('input').onblur = function(){
	document.getElementById('input').focus()
}
var img = ['./img/moe1.png','./img/moe2.png']
document.getElementById('img').src = img[((Math.floor(Math.random()*10)>4)?1:0)];
var input
function getinfo(){
	input = document.getElementById('input').value;
	$.ajax({
		type: 'GET',
		url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd='+document.getElementById('input').value+'&json=1&p=3&sid=1433_25809_21082_17001&csor=1&cb=callback',
		dataType: "jsonp",
		crossDomain: true
	});
}
function callback(data){
	var info = data.s
	document.getElementById("list").innerHTML=''
	for(let i=0;i<info.length;i++){
		alllab=document.getElementById("list");
		newlab=document.createElement("li");
		newlab.setAttribute('lid',i)
		newlab.setAttribute('onclick','go(this.innerHTML)');
		newlab.innerHTML=info[i];
		alllab.appendChild(newlab);
	}
	$("li").mouseover(function(){
		$('li').css('background-color','')
		listobj.mouse=this.getAttribute('lid')
	});
	$('ul').mouseleave(function(){
		listobj.mouse=-1
	})
}
function go(wd){
	location.href='https://www.baidu.com/s?wd='+wd
}
function gosearimg(){
	if(document.getElementById('input_url').value){
		location.href=document.getElementById('source').value+encodeURIComponent(document.getElementById('input_url').value)
	}
}
var listobj={mouse:(-1)}
function defineReactive(data, key, val) {
	Object.defineProperty(data, key, {
	    enumerable: true, // 可枚举
	    configurable: false, // 不能再define
	    get: function() {
	        return val;
	    },
	    set: function(newVal) {
	    	$('li').css('background-color','#fff')
	        val = newVal;
	        if(newVal>-1&&newVal<$('li').length){
	        	$('li')[newVal].style = 'background-color: #97c9eb;'
	        	document.getElementById('input').value =  $('li')[newVal].innerHTML
	        }
	    }
	});
}
defineReactive(listobj,'now',(-1))
document.onkeydown = function(event){
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if(e && e.keyCode==38){//上
		if(listobj.mouse!=-1){
			listobj.now=listobj.mouse
			listobj.mouse=-1
		}
		if(listobj.now > 0){
			listobj.now --
			return
		}
		if(listobj.now == 0){
			$('li').css('background-color','#fff')
			document.getElementById('input').value=input 
			listobj.now--
		}
		
	}
	if(e && e.keyCode==40){//下
		if(listobj.mouse!=-1){
			listobj.now=listobj.mouse
			listobj.mouse=-1
		}
		if(listobj.now < ($('li').length-1)){
			listobj.now ++
			return
		}
		if(listobj.now == ($('li').length-1)){
			$('li').css('background-color','#fff')
			document.getElementById('input').value=input
			listobj.now++
		}
		return
	}
}
//上传
function up(file){
	var data = new FormData();
	data.append("file", file);
	var s
	(s = new XMLHttpRequest()).open("POST", 'http://'+ip+':'+672+'/v1/upload', true);
	s.onreadystatechange=function(){
		if (s.readyState == 4) {
			var g = s.responseText;
			if((s.getResponseHeader("Content-Type") || "").match(/json/)){
				var pid = (JSON.parse(g)).wbpid
            	document.getElementById('input_url').value = 'http://ww2.sinaimg.cn/large/'+pid;
            	document.getElementById('copyurl').style.display=''
			}
			else{
				alert('上传失败')
			}
		}
	}
	s.send(data);
}
//拖动上传
var upimg = document.getElementById('upload_img')
document.body.addEventListener("dragenter", function( event ) {
	document.getElementById('text_search').style.display='none';
	document.getElementById('img_search').style.display='block';
	document.getElementById('input_url').focus()
})
upimg.addEventListener("dragenter", function( event ) {
	document.getElementById('upload_img_logo').className='upload_img_logo'
    document.getElementById('upload_img_logo').src='./img/file.svg'
}, false);
upimg.addEventListener("dragleave", function( event ) {
    document.getElementById('upload_img_logo').src='./img/add.svg'
}, false);
upimg.addEventListener("drop", function( event ) {
	document.getElementById('upload_img_logo').src='./img/add.svg'
    event.preventDefault();//禁止浏览器默认行为
    up(event.dataTransfer.files[0])
    example(event.dataTransfer.files[0])
    // UP({
    // 	file:event.dataTransfer.files[0],
    // 	success:function(pid){
    // 		console.log(pid)
    // 	},
    // 	error:function(error){
    // 		console.log(error)
    // 	},
    // 	upload:function(j){
    // 		console.log(/j/,j*100+'%')
    // 	}
    // })
    // UP(event.dataTransfer.files[0],function(pid){
    // 	console.log(pid)
    // })
    return false;//禁止浏览器默认行为
}, false);
upimg.ondragover = function(ev) {
	ev.preventDefault();
	return true;
};
document.getElementById('selectfile').onchange=function(){
	up(this.files[0])
	example(this.files[0])
}
function example(file){
	var reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function (e) {
		document.getElementById('upload_img_logo').src=this.result;
		document.getElementById('upload_img_logo').className='upload_img_example'
	}
}
new ClipboardJS('.copyurl', {
    text: function(trigger) {
        return document.getElementById('input_url').value
    }
});
function copyurl(){
	document.getElementById('qipao').style.opacity=1;
	setTimeout(function(){
		document.getElementById('qipao').style.opacity=0;
	},1000)
}