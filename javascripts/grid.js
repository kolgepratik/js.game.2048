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
	RIGHT: 39,
	PAUSE_RESUME: 32,
	HELP: 72,
	RESTART: 82,
	UNDO: 90,
    TOGGLE_BOOST: 66
};

var _settings = {
	BLOCK_SIZE: 100,
	PADDING_SIZE: 20,
	MULTIPLIER: 2,
	MAX_PAIRS: 2,
	MAX_UNDO_MOVES: 4
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
	NS: 0,
	IP: 1,
	PS: 2,
	PF: 3,
	FN: 4
};

var _user = {
	score: { c: { s: 0, m: 0, maxLevel: _symbols.ONE }, b: { s: 0, m: 0, maxLevel: _symbols.ONE } },
	game: { boost: _boosters.NONE, state: _states.IP, recentMoves: [] },
    settings: { boost: false }
};

var _a_left = [ [], [], [], [] ]; 
    _a_top = [ [], [], [], [] ],
    _a_down = [ [], [], [], [] ],
    _a_right = [ [], [], [], [] ];

function _init(options) {
	_grid = [];
	
    _user.game.state = _states.IP;
    
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
	
    var gridDimensions = ((options.size * _settings.BLOCK_SIZE) + (_settings.PADDING_SIZE * (options.size - 1)));	
	
	$grid.css({'width': gridDimensions + 'px', 'height': gridDimensions + 'px'});
	$messageContainer.css({'width': gridDimensions + 'px', 'height': gridDimensions + 'px'});
	
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
    _randomBlock();
}

function _start() {
	bindControls();
    _init({size: 4});
}

function _restart() {
    _a_left = [ [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ], [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ], [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ], [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ] ];
    
    setLeftArray();
    
    _user.game.state = _states.NS; 
    
    _init({size: 4});
}


function message(text) {    
    $('#message').html(text).show();
	$('#messageContainer').fadeIn('slow', function() {
        $('#messageContainer').fadeOut('slow');
    });           
}

function _welcome() {
    
}

function _shareScoreOnFB() {
    if(FB_SDK_LOADED) {
        FB.ui({
          method: 'feed',
          name: 'I just reached the ' + _user.score.c.maxLevel + ' level in Multiply',
          link: 'http://kolgepratik.github.io/multiply/multiply.html',
          caption: 'My score: ' + _user.score.c.s + ' points in ' + _user.score.c.m + ' moves. Beat that, if you can.!!',
          description: 'Click to compete with me in Multiply.!!'
        }, function(response){
        	message('Hey, your score was posted on facebook.!! :)');
        });
    }
}

function _gameOver() {
	var $gameOverContent = $('<div></div>');
	var $score = $('<span><b>Game over</b><br></span>');
	$score.append('You achieved a score of <b>' + _user.score.c.s + '</b> in <b>' + _user.score.c.m + '</b> moves.<br>You reached a max level of <b>' + _user.score.c.maxLevel + '</b>.<br>Press <b>Z</b> to undo your last move.<br><br>');
	var $restartButton = $('<button></button>', { type: 'button', text: 'Restart' });
	$restartButton.on('click', function() {
		$('#message').empty('');
		$('#messageContainer').hide('puff', 500);
		_restart();
	});
    
    var $shareScoreButton = $('<button></button>', { type: 'button', text: 'Share your score on Facebook' });
	$shareScoreButton.on('click', function() {
		_shareScoreOnFB();
	});
	
    _user.game.state = _states.FN;
    
	$('#message').empty().append($gameOverContent.append($score).append($shareScoreButton).append($restartButton));
	
	$('#messageContainer').show('explode', 200);
}


function _resume() {
	$('#message').empty('');
	$('#messageContainer').hide('puff', 500);	
	_user.game.state = _states.IP; 
}

function _pause() {
	var $helpContent = $('<div style="text-align: left; padding: 10px;"></div>');
	
	var $help = $('<ul></ul>');	
	$help.append($('<li></li>', { html: 'Spacebar: Pause or Resume' }));
	$help.append($('<li></li>', { html: 'Z: Undo your last move (maximum 4 moves)' }));
    $help.append($('<li></li>', { html: 'B: Toggle Boosts (default: off)' }));
	$help.append($('<li></li>', { html: 'R: Restart' }));
	$help.append($('<li></li>', { html: 'H: Help & Controls' }));
	
	_user.game.state = _states.PS; 
	
	$('#message').empty().append($helpContent.append($('<b>Options</b>')).append($help));
	
	$('#messageContainer').show('puff', 200);
}


function _pauseOrResume() {
	if(_user.game.state === _states.IP) {
		_pause();
	} else if(_user.game.state === _states.PS) {
		_resume();
	}
}

function _undo() {	
	if(_user.game.recentMoves.length > 0) {
        if(_user.game.state === _states.FN) {
            $('#message').empty('');
            $('#messageContainer').hide('puff', 500);
            _user.game.state = _states.PF;
        } else {
            _user.game.state = _states.IP;
        }
        
		var lastMove = _user.game.recentMoves.pop();
		var where = lastMove.w;
		var moveArray = lastMove.a;
		var score = lastMove.score;
		
		if(where === _controls.MOVE_LEFT) {
			for(var i=0; i<moveArray.length; i++) {
				for(var j=0; j<moveArray.length; j++) {
					_a_left[i][j] = moveArray[i][j];
				}
			}
			
			_user.score.c.s = score.s;
			_user.score.c.m = score.m;
			_user.score.c.maxLevel = score.maxLevel;
			
			setLeftArray();
		} else if(where === _controls.MOVE_TOP) {
			for(var i=0; i<moveArray.length; i++) {
				for(var j=0; j<moveArray.length; j++) {
					_a_top[i][j] = moveArray[i][j];
				}
			}
			
			_user.score.c.s = score.s;
			_user.score.c.m = score.m;
			_user.score.c.maxLevel = score.maxLevel;
			
			setTopArray();
		} else if(where === _controls.MOVE_DOWN) {
			for(var i=0; i<moveArray.length; i++) {
				for(var j=0; j<moveArray.length; j++) {
					_a_down[i][j] = moveArray[i][j];
				}
			}
			
			_user.score.c.s = score.s;
			_user.score.c.m = score.m;
			_user.score.c.maxLevel = score.maxLevel;
			
			setDownArray();
		} else if(where === _controls.MOVE_RIGHT) {
			for(var i=0; i<moveArray.length; i++) {
				for(var j=0; j<moveArray.length; j++) {
					_a_right[i][j] = moveArray[i][j];
				}
			}
			
			_user.score.c.s = score.s;
			_user.score.c.m = score.m;
			_user.score.c.maxLevel = score.maxLevel;
			
			setRightArray();
		}
		
        if(_user.game.boost !== _boosters.NONE) {
            _user.game.boost = _boosters.NONE;
            $('#boostContent').html('x' + _user.game.boost);
            $('#boostContainer').hide();
        }
        
		$('.scorePlus').hide();
		$('#undoMove').show().hide('explode', 500);
		
		_refresh();
	} else {
        message('You can only undo upto your last 4 moves.');
    }
}

function saveUserMove(arr, where) {
	var moveArray = new Array();
	for(var i=0; i <arr.length; i++) {
		var temp = new Array();
		for(var j=0; j<arr.length; j++) {
			temp.push(arr[i][j]);
		}
		moveArray.push(temp);
	}
	
	if(_user.game.recentMoves.length === _settings.MAX_UNDO_MOVES) {
		_user.game.recentMoves = _user.game.recentMoves.splice(1);
	}
	
	var score = { s: _user.score.c.s, m: _user.score.c.m, maxLevel: _user.score.c.maxLevel }; 
	
	_user.game.recentMoves.push({ a: moveArray, score: score, w: where });
}

function _help() {
	var $helpContent = $('<div style="text-align: left; padding: 10px;"></div>');
	
	var $help = $('<ul></ul>');	
	$help.append($('<li></li>', { html: 'When 2 blocks with the same numbers collide, they combine and a new block is formed with twice the value of original blocks.' }));
	$help.append($('<li></li>', { html: 'You will also receive boosts randomly. When a boost is available, the grid will flash. Boosts can be of any value. For example: a boost of x8 means that the next time you combine any 2 same value blocks together, the new block will be multiplied by 8 times its original value rather than by 2. Press <b>B</b> to Enable/Disable Boosts.' }));
	$help.append($('<li></li>', { html: 'Use arrow keys left, right, top, and down to move the blocks to left, right, top, or bottom respectively.' }));
	
	_user.game.state = _states.PS; 
	
	$helpContent.append($('<b>Help</b>')).append($help).append('Press <b>spacebar</b> to resume your game.');
	
	$('#message').empty().append($helpContent);
	
	$('#messageContainer').show('puff', 200);
}

function bindControls() {
	$(document).on('keydown', function(event) {
		if(_user.game.state === _states.IP || _user.game.state === _states.PF) {
			if(event.which ===_control_bindings.LEFT) {
				_move(_controls.MOVE_LEFT);
			} else if(event.which ===_control_bindings.TOP) {
				_move(_controls.MOVE_TOP);
			} else if(event.which ===_control_bindings.DOWN) {
				_move(_controls.MOVE_DOWN);
			} else if(event.which ===_control_bindings.RIGHT) {
				_move(_controls.MOVE_RIGHT);
			} 
		}
        
        if(_user.game.state === _states.IP || _user.game.state === _states.PF || _user.game.state === _states.FN) {
            if(event.which ===_control_bindings.UNDO) {
                _undo();
            }
        }
		
		if(event.which ===_control_bindings.PAUSE_RESUME) {
			_pauseOrResume();
		} else if(event.which ===_control_bindings.HELP) {
			_help();
		} else if(event.which ===_control_bindings.RESTART) {
			_restart();
		} else if(event.which ===_control_bindings.TOGGLE_BOOST) {
			_toggleBoost();
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

function _toggleBoost() {
    if(_user.settings.boost) {
        _user.game.boost = _boosters.NONE;
        _user.settings.boost = false;
        $('#boostContent').html('x' + _user.game.boost);
        $('#boostContainer').hide();
        message('Boosts are off');                
    } else {
        _user.settings.boost = true;
        message('Boosts are on');
    }
    
    if(_user.game.state === _states.PS) {
        setTimeout(_pause, 500);
    }
}

function boost() {
	if(_user.settings.boost) {
        var rndm = Math.floor(Math.random() * _multipliers.length);
        if(rndm < _multipliers.length) {
            if(_multipliers[rndm] === _user.score.c.maxLevel) {
                var boosterRndm = Math.floor(Math.random() * _boosts.length);
                if(boosterRndm < _boosts.length) {
                    _user.game.boost = _boosts[boosterRndm];
                    $('#boostContent').html('x' + _user.game.boost);
                    $('#boostContainer').show();
                    $('#grid').effect('highlight', 1000);
                }
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
	
	saveUserMove(arr, where);
	
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
    
    if(_user.game.boost !== _boosters.NONE) {
        consumedBoost();
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
