var _grid;

var _controls = {
	MOVE_LEFT: 0,
	MOVE_TOP: 1,
	MOVE_DOWN: 2,
	MOVE_RIGHT: 3
};

var _control_bindings = {
	LEFT: 37,
	TOP: 38,
	DOWN: 40,
	RIGHT: 39
};

var _settings = {
	BLOCK_SIZE: 100,
	PADDING_SIZE: 20,
	MULTIPLIER: 2,
	MAX_PAIRS: 2
};

var _symbols = {
	EMPTY: 0,
	ONE: 2
};

var _boosters = {
	NONE: 2,
	QUADRA: 4,
	OCTA: 8,
	HEXA: 16,
	PETA: 32
};

var _boosts = [
	_boosters.QUADRA,
	_boosters.OCTA,
	_boosters.HEXA,
	_boosters.PETA
];

var _multipliers = [
    2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768
];

var _states = {
	IP: 0,
	PF: 1,
	FN: 2
};

var _user = {
	score: { c: { s: 0, m: 0, maxLevel: _symbols.ONE }, b: { s: 0, m: 0, maxLevel: _symbols.ONE } },
	game: { boost: _boosters.NONE, state: _states.IP }
};

var _a_left = [ [], [], [], [] ];

var _a_top = [ [], [], [], [] ];

var _a_down = [ [], [], [], [] ];

var _a_right = [ [], [], [], [] ];

function _init(options) {
	_grid = new Array();
	
	var $grid = $('#grid').empty();
	
	$grid.append($('.messageContainer').clone().attr('id', 'messageContainer'));

	var $messageContainer = $('#messageContainer'); 
	
	if(_user.score.c.s > _user.score.b.s) {
		_user.score.b.s = _user.score.c.s;
		_user.score.b.m = _user.score.c.m;
		_user.score.b.maxLevel = _user.score.c.maxLevel;
	}
	
	_user.score.c.s = 0;
	_user.score.c.m = 0;
	_user.score.c.maxLevel = _symbols.ONE;
	_user.game.boost = _boosters.NONE;
	_user.game.state = _states.IP;
	
	var width = ((options.size * _settings.BLOCK_SIZE) + (_settings.PADDING_SIZE * (options.size - 1)));
	var height = ((options.size * _settings.BLOCK_SIZE) + (_settings.PADDING_SIZE * (options.size - 1)));
	
	$grid.css({'width': width + 'px', 'height': height + 'px'});
	$messageContainer.css({'width': width + 'px', 'height': height + 'px'});
	
	$messageContainer.find('.message').attr('id', 'message');
	$messageContainer.hide();
	
	var cnt = 0;
	for(var i=0; i<options.size; i++) {
		for(var b=0; b<options.size; b++) {
			_grid[cnt] = { s: _symbols.EMPTY };
			
			_grid[cnt].p = {
				t: (((i+1) * (_settings.PADDING_SIZE/2)) + (i * _settings.BLOCK_SIZE)),
				l: (((b+1) * (_settings.PADDING_SIZE/2)) + (b * _settings.BLOCK_SIZE))
			};
			
			var $block = $('<div><span></span></div>'); 
					
			$block.addClass('block');
			$block.addClass('block_' + cnt);
			$block.css({ top: _grid[cnt].p.t + 'px' , left: _grid[cnt].p.l + 'px'});
			$block.css({ width: _settings.BLOCK_SIZE + 'px' , height: _settings.BLOCK_SIZE + 'px'});
			
			$grid.append($block);
			
			cnt++;
		}
	}
	
	_randomBlock();
	
	bindControls();
}

function _start() {
	_init({size: 4});
}

function _gameOver() {
	var $gameOverContent = $('<div></div>');
	var $score = $('<span><b>Game over</b><br></span>');
	$score.append('You achieved a score of <b>' + _user.score.c.s + '</b> in <b>' + _user.score.c.m + '</b> moves.<br>You reached a max level of <b>' + _user.score.c.maxLevel + '</b>.<br><br>');
	var $restartButton = $('<button></button>', { type: 'button', text: 'Restart' });
	$restartButton.on('click', function() {
		$('#message').empty('');
		$('#messageContainer').hide('puff', 500);
		_start();
	});
	
	$('#message').append($gameOverContent.append($score).append($restartButton));
	
	$('#messageContainer').show('explode', 500);
}

function bindControls() {
	$(document).on('keydown', function(event) {
		if(event.which ===_control_bindings.LEFT) {
			_move(_controls.MOVE_LEFT);
		} else if(event.which ===_control_bindings.TOP) {
			_move(_controls.MOVE_TOP);
		} else if(event.which ===_control_bindings.DOWN) {
			_move(_controls.MOVE_DOWN);
		} else if(event.which ===_control_bindings.RIGHT) {
			_move(_controls.MOVE_RIGHT);
		}
	});
}

function animateBlock(blockElement, blockProperties) {
	blockElement.find('span').animate({ fontSize: '50px' }, 400, function() {
		blockElement.find('span').animate({ fontSize: '40px' }, 400);
	});
}

function _refresh(newRandomBlock) {
	var $blocks = $('#grid .block');
	for(var b=0; b<_grid.length; b++) {
		var $b = $($blocks[b]);
		$b.removeClass($b.attr('class')).addClass('block block_' + b + ' level_' + (_grid[b].s));
		if(_grid[b].s === _symbols.EMPTY) {
			$b.find('span').html('');
		} else {
			$b.find('span').html(_grid[b].s);
		}
		
		if(_grid[b].c) {
			animateBlock($b, _grid[b]);
			_grid[b].c = false;
		}
		
		if(newRandomBlock) {
			$('#grid .block_' + newRandomBlock).hide().show('puff', 200);
		}
	}
	
	$('#scoreContent').html(_user.score.c.s);//.effect('highlight');
	$('#movesContent').html(_user.score.c.m);
}

function _randomBlock() {
	var freeGrid = new Array();
	for(var g=0; g<_grid.length; g++) {
		if(_grid[g].s === _symbols.EMPTY) {
			freeGrid.push(g);
		}
	}
	
	if(freeGrid.length > 0) {
		var retries = 0;		
		var rndm = -1;
		while(rndm < 0 || rndm >= freeGrid.length) {
			rndm = Math.floor(Math.random() * freeGrid.length);
			if(++retries === 10) {
				break;
			}
		};
		
		if(retries < 10) {
			_grid[freeGrid[rndm]].s = _symbols.ONE;
			
			_refresh(freeGrid[rndm]);
		} else {
		}
		
		boost();
		
		_user.game.state = _states.IP;
	} else {
		_user.game.state = _states.PF;
	}
}

function boost() {
	var rndm = Math.floor(Math.random() * _multipliers.length);
	if(rndm < _multipliers.length) {
		if(_multipliers[rndm] === _user.score.c.maxLevel) {
			var boosterRndm = Math.floor(Math.random() * _boosts.length);
			if(boosterRndm < _boosts.length) {
				console.log('boost: ' + boosterRndm + ' value: ' + _boosts[boosterRndm]);
				_user.game.boost = _boosts[boosterRndm];
				$('#boostContent').html('x' + _user.game.boost);
				$('#boostContainer').show();
				$('#grid').effect('highlight', 1000);
			}
		}
	}	
}

function consumedBoost() {
	$('#boostContainer').hide();
	_user.game.boost = _boosters.NONE;
}

function getLeftArray() {
	var itr = 0;
	for(var gc=3; gc<16; gc+=4) {
		for(var c=0; c<4; c++) {
			_a_left[itr][c] = _grid[gc-c].s;
		}
		itr++;
	}
}

function getLeftPositionInGrid(itr, c) {
	return (((itr*_a_left.length) + 3) - c);
}

function setLeftArray() {
	for(var itr=0; itr<4; itr++) {
		for(var c=1; c<=4; c++) {
			var previousLevel = _grid[((4*itr) + (4-c))].s;
			var newLevel = _a_left[itr][c - 1];
			
			if((previousLevel !== _symbols.EMPTY) && (newLevel === (previousLevel*_settings.MULTIPLIER))) {
				_grid[((4*itr) + (4-c))].c = true;
				_grid[((4*itr) + (4-c))].d = _controls.MOVE_LEFT;
			} else {
				_grid[((4*itr) + (4-c))].c = false;
			}
			
			_grid[((4*itr) + (4-c))].s = _a_left[itr][c - 1];
		}
	}
}


function getTopArray() {
	var itr = 0;
	for(var gc=15; gc>11; gc--) {
		for(var c=0; c<4; c++) {
			_a_top[itr][c] = _grid[gc-(c * 4)].s;
		}
		itr++;
	}
}

function getTopPositionInGrid(itr, c) {
	return (((_a_top.length * _a_top.length) - itr) - 1) - (c*_a_top.length);
}

function setTopArray() {
	for(var itr=0; itr<4; itr++) {
		for(var c=1; c<=4; c++) {
			var previousLevel = _grid[((4 * (4-(c-1))) -(itr+1))].s;
			var newLevel = _a_top[itr][c - 1];
			
			if((previousLevel !== _symbols.EMPTY) && (newLevel === (previousLevel*_settings.MULTIPLIER))) {
				_grid[((4 * (4-(c-1))) -(itr+1))].c = true;
				_grid[((4 * (4-(c-1))) -(itr+1))].d = _controls.MOVE_TOP;
			} else {
				_grid[((4 * (4-(c-1))) -(itr+1))].c = false;
			}
			
			_grid[((4 * (4-(c-1))) -(itr+1))].s = _a_top[itr][c - 1];
		}
	}
}


function getDownArray() {
	var itr = 0;
	for(var gc=0; gc<4; gc++) {
		for(var c=0; c<4; c++) {
			_a_down[itr][c] = _grid[(itr + (c * 4))].s;
		}
		itr++;
	}
}

function getDownPositionInGrid(itr, c) {
	return (itr + (c * _a_down.length));
}

function setDownArray() {
	for(var itr=0; itr<4; itr++) {
		for(var c=1; c<=4; c++) {
			var previousLevel = _grid[(((c-1) * 4) + itr)].s;
			var newLevel = _a_down[itr][c - 1];
			
			if((previousLevel !== _symbols.EMPTY) && (newLevel === (previousLevel*_settings.MULTIPLIER))) {
				_grid[(((c-1) * 4) + itr)].c = true;
				_grid[(((c-1) * 4) + itr)].d = _controls.MOVE_DOWN;
			} else {
				_grid[(((c-1) * 4) + itr)].c = false;
			}
			
			_grid[(((c-1) * 4) + itr)].s = _a_down[itr][c - 1];
		}
	}
}


function getRightArray() {
	var itr = 0;
	for(var gc=0; gc<16; (gc += 4)) {
		for(var c=0; c<4; c++) {
			_a_right[itr][c] = _grid[gc + c].s;
		}
		itr++;
	}
}

function getRightPositionInGrid(itr, c) {
	return ((_a_right.length * itr) + c);
}

function setRightArray() {
	for(var itr=0; itr<4; itr++) {
		for(var c=1; c<=4; c++) {
			var previousLevel = _grid[(4*itr) + (c-1)].s;
			var newLevel = _a_right[itr][c - 1];
			
			if((previousLevel !== _symbols.EMPTY) && (newLevel === (previousLevel*_settings.MULTIPLIER))) {
				_grid[(4*itr) + (c-1)].c = true;
				_grid[(4*itr) + (c-1)].d = _controls.MOVE_RIGHT;
			} else {
				_grid[(4*itr) + (c-1)].c = false;
			}
			
			_grid[(4*itr) + (c-1)].s = _a_right[itr][c - 1];
		}
	}
}

function _move(where) {
	var plussed = 0;
	if(where === _controls.MOVE_LEFT) {
		getLeftArray();
		
		plussed = _processMove(_a_left, _controls.MOVE_LEFT);
		
		setLeftArray();
	} else if(where === _controls.MOVE_TOP) {
		getTopArray();
		
		plussed = _processMove(_a_top, _controls.MOVE_TOP);
		
		setTopArray();
	} else if(where === _controls.MOVE_DOWN) {
		getDownArray();
		
		plussed = _processMove(_a_down, _controls.MOVE_DOWN);
		
		setDownArray();
	} else if(where === _controls.MOVE_RIGHT) {
		getRightArray();
		
		plussed = _processMove(_a_right, _controls.MOVE_RIGHT);
		
		setRightArray();
	}
	
	_refresh();
	if(_user.game.state === _states.PF && plussed === 0) {
		_gameOver();
	} else {
		_randomBlock();
	}
}

function _processMove(arr, where) {
	var plussed = 0; 
	for(var itr=0; itr<arr.length; itr++) {		
		var derived = new Object();
		for(var t=arr[itr].length - 1; t>=0; t--) {
			for(var i=arr[itr].length - 1; i>=0; i--) {
				var j = i- 1;
				
				if(j != -1) {				
					if(arr[itr][i] === _symbols.EMPTY) {
						while(j>=0 && arr[itr][j] === _symbols.EMPTY) {
							j--;
						};
						if((i - 1) !== j) {
							if(j === -1) {
								j = 0;
							}
							arr[itr][i] = arr[itr][j];
							arr[itr][j] = _symbols.EMPTY;							
						} else {
							while(j>=0) {
								arr[itr][j+1] = arr[itr][j];
								j--;
							};
							arr[itr][++j] = _symbols.EMPTY;
						}
					} else {
						while(j>0 && arr[itr][j] === _symbols.EMPTY) {
							j--;
						};
						
						if((arr[itr][i] === arr[itr][j]) && !(derived['' + i] || derived['' + j])) {
							if(_user.game.boost !== _boosters.NONE) {
								arr[itr][i] *= _user.game.boost;
								consumedBoost();
							} else {
								arr[itr][i] *= _settings.MULTIPLIER;
							}
							arr[itr][j] = _symbols.EMPTY;
							derived['' + i] = true;
							plussed++;
							_user.score.c.s += arr[itr][i];
							if(_user.score.c.maxLevel < arr[itr][i]) {
								_user.score.c.maxLevel = arr[itr][i];
							}
							animateMove(itr, j, i, where, arr[itr][i]);
						} else {
							arr[itr][i - 1] = arr[itr][j];
							if((i - 1) !== j) {
								arr[itr][j] = _symbols.EMPTY;
							}
						}
					}					
				}
			}			
		} 
	}
	
	_user.score.c.m++;
	
	return plussed;
}

function animateMove(level, start, end, where, newValue) {
	if(where === _controls.MOVE_LEFT) {
		var s = getLeftPositionInGrid(level, start);
		var e = getLeftPositionInGrid(level, end);
		
		var $sb = $('.block_' + s).clone().css({'top':_grid[s].p.t, 'left':_grid[s].p.l, 'z-index': 2, border: '4px solid #83ACAC'});
		var $eb = $('.block_' + e).clone().css({'top':_grid[e].p.t, 'left':_grid[e].p.l, 'z-index': 2});
		
		$('#grid').append($sb).append($eb);
		
		$sb.animate({ left: _grid[e].p.l }, ((end - start) * 200), function() { $sb.remove(); $eb.remove(); });
	} else if(where === _controls.MOVE_TOP) {
		var s = getTopPositionInGrid(level, start);
		var e = getTopPositionInGrid(level, end);
		
		var $sb = $('.block_' + s).clone().css({'top':_grid[s].p.t, 'left':_grid[s].p.l, 'z-index': 2, border: '4px solid #83ACAC'});
		var $eb = $('.block_' + e).clone().css({'top':_grid[e].p.t, 'left':_grid[e].p.l, 'z-index': 2});
		
		$('#grid').append($sb).append($eb);
		
		$sb.animate({ top: _grid[e].p.t }, ((end - start) * 200), function() { $sb.remove(); $eb.remove(); });
	} else if(where === _controls.MOVE_DOWN) {
		var s = getDownPositionInGrid(level, start);
		var e = getDownPositionInGrid(level, end);
		
		var $sb = $('.block_' + s).clone().css({'top':_grid[s].p.t, 'left':_grid[s].p.l, 'z-index': 2, border: '4px solid #83ACAC'});
		var $eb = $('.block_' + e).clone().css({'top':_grid[e].p.t, 'left':_grid[e].p.l, 'z-index': 2});
		
		$('#grid').append($sb).append($eb);
		
		$sb.animate({ top: _grid[e].p.t }, ((end - start) * 200), function() { $sb.remove(); $eb.remove(); });
	} else if(where === _controls.MOVE_RIGHT) {
		var s = getRightPositionInGrid(level, start);
		var e = getRightPositionInGrid(level, end);
		
		var $sb = $('.block_' + s).clone().css({'top':_grid[s].p.t, 'left':_grid[s].p.l, 'z-index': 2, border: '4px solid #83ACAC'});
		var $eb = $('.block_' + e).clone().css({'top':_grid[e].p.t, 'left':_grid[e].p.l, 'z-index': 2});
		
		$('#grid').append($sb).append($eb);
		
		$sb.animate({ left: _grid[e].p.l }, ((end - start) * 200), function() { $sb.remove(); $eb.remove(); });
	}
	
	$('.scorePlus').hide();
	$('#plus_' + newValue).show().hide('explode', 500);
}
