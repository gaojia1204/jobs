//1、初始化，名字更改。2、点击开始两图片转，按钮不可变，出现选择3，点击猜拳，两个框内出现剪刀石油部，判断结果，4，再次点击开始
//三个函数参与1.玩家、电脑、裁判。
function User(name) {
    this.name=name;
    this.name1=document.getElementsByClassName('name');
}
User.prototype.init=function(){
    this.name1[0].innerHTML='我:'+this.name;
}
var user=new User('宝强');
user.init();
function Comp(name){
    this.name=name;
    this.name2=document.getElementsByClassName('name');
}
Comp.prototype.init=function(){
    this.name2[1].innerHTML='电脑:'+this.name;
}
var comp=new Comp('宋哲');
comp.init();
function Game(){
    this.btn=document.getElementById("play");
    this.Anim=document.getElementsByClassName('anim');
    this.guess=document.getElementById('guess');
    this.text=document.getElementById("text");
    this.li=this.guess.getElementsByTagName('div');
    this.num2=0;
    this.num1=0;
    this.timer1=null;
}
Game.prototype.uPlay=function(){
    var This=this;
    var i=0;
    this.timer1=setInterval(function(){
        i++;
        num2=i%3;
        This.Anim[0].className='anim guess'+num2;
        This.Anim[1].className='anim guess'+num2;
    },400)
}
Game.prototype.play=function(){
    var This=this;
    game.uPlay();
    This.guess.style.display='block';
    This.text.innerHTML='请出拳.....'
    This.btn.className='disabled'
}

Game.prototype.verdict=function(num){
    var This=this;

    This.num1=num;
    clearInterval(This.timer1);
    This.Anim[0].className='anim guess'+num;
    This.Anim[1].className='anim guess'+num2;
    This.btn.className='';
    This.btn.innerHTML='再来一局';
    var cha=num-num2;
    switch(cha){
        case 0:
            This.text.innerHTML='平局.....'
            break;
        case -1:
        case 2:
            This.text.innerHTML='你赢了.....'
            break;
        case 1:
        case -2:
            This.text.innerHTML='你输了.....'
            break;
    }

}
Game.prototype.init=function(){
}
var game=new Game();
