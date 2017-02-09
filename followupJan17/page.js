$(document).ready(function(){
	initAnimationFrame();
    var $cssRules = (function(){
		var head = document.head || document.getElementsByTagName('head')[0];
		var cssDom = document.createElement('style');
		var cssId = 'AX_transition_' + (+new Date());
		var cssSheet = null;
		cssDom.setAttribute('type','text/css');
		cssDom.setAttribute('id', cssId);
		head.appendChild(cssDom);
		for(var i = 0,len = document.styleSheets.length; i < len; i += 1){
			if(document.styleSheets[i].ownerNode.id === cssId){
				cssSheet = document.styleSheets[i];
				break;
			}
		}
		
		return {
			add : function(selector, cssText){
				var rules = cssSheet.rules || cssSheet.cssRules;
				if(cssSheet.addRule){
					cssSheet.addRule(selector, cssText, rules.length);
				}else if(cssSheet.insertRule){
					cssSheet.insertRule(selector + ' {' + cssText + '}', rules.length);
				}
				return rules.length-1
			},
			remove:function(index){
				cssSheet.deleteRule(0)
			}
		}
	})();

	var $alertDom = $('#alert');	
	var $alert = function(msg){
		$('#alertText').text(msg);
		$alertDom.show();
	};
	$('#alerTClose').bind('click',function(){
		$alertDom.hide();
	});

	//no chance
	$noChance = $('#noChance');
	$noChance.bind('click',function(){
		$noChance.hide();
	});


	var initLottery = function(){
		var isIoBusy = false;
		var prizeValueDom = $('#prizeValue');
		var prizeAlartDom = $('#prizeAlart');
		var config = {
			speed:10,
			slowDown:1080,
			speedSlow:0.09,
			slowRatio:0.99
		};
		var $lottery = function(id){
			var deg;
			switch( Number(id) ){
				case 7 :  //3
					deg = [5];
					break;
				case 6 :  //5
					deg = [0];
					break;
				case 1 : //10
					deg = [2];
					break;
				case 2 :  //20
					deg = [4];
					break;
				case 8 :  //30
					deg = [3];
					break;
				case 3 :  //50
					deg = [1];
					break;
				case 4 :  //100
					deg = [6];
					break;
			}
			return 0-deg*(360/7);
		};

		prizeAlartDom.bind('click',function(){
			prizeValueDom.text('0元');
			prizeAlartDom.hide();
			isIoBusy = false;
		});

		var $getAwards = function( prizeName,prizeValue ){
			
			//次数减一
			$('#awardsChance').text(--awardsChance );
			if( !awardsChance ){
				prizeAlartDom.addClass('tip');
			}else{
				prizeAlartDom.removeClass('tip');
			}
			//中奖的钱
			prizeValueDom.text( prizeName );
			prizeAlartDom.show();
			//中奖加钱
			awardIncomeTotal += prizeValue;
			$('#awardIncomeTotal').html( awardIncomeTotal+'元'  );
			//更新中奖名单
			initList();
		};
		var box = $('#carousel');
		$('#pointer').bind('click',function(){
			if( isIoBusy || !isDataLoaded ){return false}

			var _error = '';
			( !serverTime || !startTime || !endTime ) && ( _error = '系统繁忙，请稍后重试' );
			( Number(serverTime) >= Number(endTime) ) && ( _error = '活动已结束！' );
			( Number(serverTime) < Number(startTime) ) && ( _error = '活动未开始！' );
			
			if( !!_error ){
				$alert( _error );
				return false;
			}

			if( !awardsChance ){
				$noChance.show();
				return false;
			}

			isIoBusy = true;
			var rotateDeg = 0; 
			var　timer = requestAnimationFrame(function waitFn(){
				rotateDeg += config.speed;
				box.css('-webkit-transform','rotate('+rotateDeg+'deg)')
				timer = requestAnimationFrame( waitFn )
			});
			
			$.ajax({
				type:'GET',
				timeout: 30*1000,
				url:'/home/activity/drawLottery201604?docId='+docid+'&activityId='+_activityId, 
				success:function (res) {
				
					cancelAnimationFrame(timer);
					
					var res = eval('('+res+')');
					if( Number(res.code) !== 200 ){
						var _errorMsg = res.msg || '数据出错，请重新进入';
						$alert( _errorMsg );
						isIoBusy = false;
						box.css('-webkit-transform','rotate(0deg)')
						return false;
					}
			
					var rewardInfo = res.msg;
					var prize = $lottery( rewardInfo.awardId );
					var goal = 360-rotateDeg%360 + config.slowDown + prize;

					var speed = config.speed;
					var speedSlow = config.speedSlow;
					var　priceTimer = requestAnimationFrame(function doLottery(){
						if( goal <=0 || speed <= 0 ){
							cancelAnimationFrame( priceTimer );
							setTimeout(function(){
								$getAwards( rewardInfo.awardName,rewardInfo.awardValue );
							},300)
							return false;
						}
						speedSlow = speedSlow*config.slowRatio;
						speed = speed - speedSlow;
						goal -= speed;
						rotateDeg += speed;
						( goal <= 0 || speed <= 0) && ( rotateDeg = prize );
						box.css('-webkit-transform','rotate('+rotateDeg+'deg)')
						priceTimer = requestAnimationFrame( doLottery );
					});

				},
				error:function(){
					$alert( '网络出错，请重试' );
					isIoBusy = false;
					cancelAnimationFrame(timer);
					box.css('-webkit-transform','rotate(0deg)')
					return false;
				}
			});
		});

		
	};

	var $template = function(info){
		var _html = '';
		var len = info.length ;
		for(var i=0;i<len;i++){
			var _time = Number( info[i].awardTime) ;
			_time = !!_time ? $parseNum( new Date( _time*1000 ).getHours() )+':'+ $parseNum( new Date( _time*1000 ).getMinutes() ):'';

			_html += ( '<li><span class="name">'+info[i].docName+
					'</span><span class="hos">'+info[i].hospitalName+
					'</span><span class="award">'+info[i].awardName+'</span>'+
					'</span><span class="time">'+_time+'</span>' );
		}
		return _html;
	};

	var rollTimer;
	var $roll = function(boxDom){

		if( parseInt(listWrapperDom.css('max-height'),10) >= listDom[0].scrollHeight ){return false}
		clearTimeout( rollTimer );

		var _moveLiDom =  boxDom.children().first();
		var _moveHeight = -1 *( _moveLiDom.height()+parseInt(_moveLiDom.css('margin-bottom')));
		var curAniId = $cssRules.add('.roll','-webkit-transition:1s -webkit-transform linear ;-webkit-transform: translateY('+_moveHeight+'px);');
		boxDom.addClass('roll');
		
		boxDom.bind('webkitTransitionEnd',function(){
			$cssRules.remove( curAniId );
			boxDom.removeClass('roll');
			boxDom.hide();
			boxDom.append( _moveLiDom );
			boxDom.show();

			rollTimer = setTimeout(function(){
				$roll( boxDom )
			},1000);
			boxDom.unbind('webkitTransitionEnd');
		});
	};
	
	var listIoBusy = false;
	var initList = function(){
		if( listIoBusy ){return false};
		clearTimeout( rollTimer );
		listDom.unbind('webkitTransitionEnd');
		listIoBusy = true;

		$.ajax({
			type:'GET',
			timeout: 30*1000,
			url:'/home/activity/getLotteryScroll201604?pageSize=20&docId='+docid+'&activityId='+_activityId, 
			success:function (res) {
				var res = eval('('+res+')');
				if( Number(res.code) !== 200 ){ $alert('数据出错，请重新进入');return false;}

				var list = res.msg.list;
				list.length ? listDom.html( $template(list) ) : listDom.html('<span>暂无中奖名单</span>').addClass('nolist');
				
				//根据list的高度重新设置list的背景高度
				var _height = listWrapperDom.height() + parseInt( listWrapperDom.css('margin-top') )+parseInt( listWrapperDom.css('margin-bottom') )
				listBgWrapper.height( _height )
				whiteBgDom.height( _height - parseInt( whiteBgDom.css('top'),10)*1.5);

				$roll( listDom );

				listIoBusy = false;
			},
			error:function(){
				listDom.html('<span>暂无中奖名单</span>').addClass('nolist');
				listIoBusy = false;
			}
		});
	};

	var initProgress = function(){
		var rangeList = [
			[0,10,20,30,40]
		]
		$rendBar = function(opts){
			var range = opts.range;
			var rangeLen = range.length;
			if( rangeLen < 2 ){return false;}

			var barDom = $('#'+opts.id).find('.back-bar');
			var barWidth = barDom.width();
			var perWidth = rangeLen > 2 ? barWidth * ( 1/(rangeLen-1 )) : barWidth;

			var $calculate = function(num){
				var _dis = 0;
				if( num >= range[rangeLen-1] ){
					return barWidth
				}

				for(var i = 1; i< rangeLen ;i++){
					if( num < range[i] ){
						_dis = perWidth * ( i-1 ) + ( num - range[i-1] )/( range[i] - range[i-1])*perWidth
						break;
					}
				}
				return _dis;
			};
			//根据随访数改变进度条的数值
			var span=$('#range').children();
			var numb=Number(span[3].innerText)+Math.ceil((opts.num-30)/10)*10;
			for(var i=0;i<=3;i++){
				if(opts.num<=numb){
					if(opts.num<40){
						span[i].innerHTML=Number(span[i].innerText)
					}else{
						span[i].innerHTML=Number(span[i].innerText)+Math.floor((opts.num-30)/10)*10;
					}

				}
			};
			//下标的变化
			var aaa=0;

			if(opts.num<40){
				aaa=opts.num;
				var curDis = $calculate(aaa);
				console.log(curDis);
				console.log(aaa);
			}else{
				aaa=30+opts.num-Number(span[3].innerText);
				console.log(Number(span[3].innerText));
				var curDis = $calculate(aaa);
				console.log(curDis);
			}

			//渲染进度条数据
			barDom.find('[node-type=my_progress_box]').css( 'width',curDis );
			barDom.find('[node-type=my_num_box]').css( 'left',curDis );
			barDom.find('[node-type=mine]').text( opts.num );

			//进度的状态
			opts.showStatus && $('[node-type=status_'+opts.id+']').addClass(opts.showStatus)

		};
		console.log(docid);
		$.ajax({
			type:'GET',
			timeout: 30*1000,
			url:'/home/activity/getActivityDetailFlup201604?docId='+docid+'&activityId='+_activityId,
			success: function (res) {
				var res = eval('('+res+')');
				console.log(res);
				if( Number(res.code) !== 200 ){ $alert('数据出错，请重新进入');return false;}
				isDataLoaded = true;
						
				//中奖收入
				awardIncomeTotal = res.msg.awardIncomeTotal;
				$('#awardIncomeTotal').html( awardIncomeTotal  );

				//中奖次数
				awardsChance = res.msg.lotteryNum;
				$('#awardsChance').text( awardsChance  );
				$('#ccc').text( awardsChance  );
				//系统时间
				serverTime = res.msg.serverTime;
				startTime = res.msg.startTime;
				endTime = res.msg.endTime;

				//是否显示中奖弹层提示。
				//var prizeTipDom = $('#prizeTip');
				//!!(res.msg.flupNum < 10) ? prizeTipDom.show() : prizeTipDom.hide();

				//随访次数信息
				$('#mine').text( res.msg.flupNum );
				var Num=res.msg.flupNum;
				// var Num=1;
				// console.log(Num);
				// $('#num').html(Num);
				// if( Number(serverTime) < Number(endTime) ) {
				// 	$('#need').text( 10-res.msg.flupNum%10);
				// }
				//判断是否抽过将
				var firstLucky=res.msg.firstLucky;
				if(firstLucky.id==0){
					$('#uuu').html(0);
					$('#iii').html(0);
					$('#into').css({
						visibility :'visible'
					});
				}else {
					if(3-Num>0){
						console.log(3-Num);
						$('#into').css({
							visibility :'visible'
						});
						$('#iii').html(3-Num);
						$('#uuu').html(firstLucky.value);
					}else{
						console.log(3-Num);
						$('#into').css({
							visibility :'hiddern'
						});
					}
				}
				$rendBar({
					id:'bar_2',
					range:rangeList[0],
					num:Num,
					showStatus :true
				});




			},
			error:function(){
				$alert('网络出错，请重试！');
			}
		});
	};
	
	var awardsChance = 0;
	var awardIncomeTotal = 0 ;
	var serverTime,startTime,endTime;
	var isDataLoaded = false;
	var init = function(data){
		docid = data;
		// docid = '55aa04137f10084c278b45b4';
		initProgress();
		initLottery();
		initList();
	};

	var $param = $queryToJson( location.href.split('?')[1] );
	var _activityId = $param.activityId || '';
	// var _activityId = 2000502364;
	var docid ;
	$getAppApi({
		sucCallback:init,
		errorCallback:function(){
			alert('数据出错，请重新进入或升级客户端版本');
		}
	});


	//关闭弹层事件
	$('.prize').bind('click',function(){
		$(this).hide();
		$('html,body').css('height','auto').css('overflow','')
	});
	//活动规则
	$('[action-type=showDesc]').bind('click',function(){
		var $wrapper = $('.rule-desc');
		$wrapper.show();
		var winHeight = $(window).height();
		$wrapper.find('.box').height( winHeight*0.8 ).css('margin-top',winHeight*0.1);
		$('html,body').css('height',$(window).height()).css('overflow','hidden')
	});
	//活动规则
	$('[action-type=more]').bind('click',function(){
		location.href = '../doc_guide/followupAllTip.html';
	});
	//为解决放大字体问题,各种高度重新计算
	var listDom = $('#list');
	var listBgWrapper = $('#listBgWrapper');
	var listWrapperDom = $('#listWrapper');
	var whiteBgDom = $('#listBgWrapper .whiteBg');
	var rulesDom = $('#rules');
	//转盘大小
	$('.lottery').height( $('.lottery').width() );
	//中奖名单与顶部的距离
	listBgWrapper.css('margin-top',window.lib.flexible.rem2px(1));
	//规则与顶部的距离
	$('#ruleWrapper').height( rulesDom.height() + parseInt(rulesDom.css('top'),10)*2);
	//加载关闭按钮
	$('body').append('<div style="display:none;">'+
	    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" style="position:absolute">'+
			'<symbol id="close" viewBox="-1 -1 16 17">'+
			    '<title>Icon/Clear（32x32）</title><path d="M14 1.944l-1.4-1.4-5.6 5.6-5.6-5.6-1.4 1.4 5.6 5.6-5.6 5.6 1.4 1.4 5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6 5.6-5.6z" fill="" fill-rule="evenodd" fill-opacity=""/>'+
			'</symbol>'+
	    '</svg></div>');

});