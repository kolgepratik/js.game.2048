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
    MODE_SELECT: 77,
    HINT: 78,
    SAVE_GAME: 86,
    LOAD_GAME: 76,    
    TOGGLE_BOOST: 66
};

var _settings = {
	BLOCK_SIZE: 100,
	PADDING_SIZE: 20,
	MULTIPLIER: 2,
	MAX_PAIRS: 2,
	MAX_UNDO_MOVES: 4,
    BEST_SCORE_COOKIE_NAME: 'bestScoreCookie',
    SAVE_GAME_COOKIE_NAME: 'saveUserGameCookie'
};

var _symbols = {
	EMPTY: 0,
	ONE: 2,
    THREE_ONE: 1
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

var _symbolMappings = {
    a: {        
        2: 'A',
        4: 'B',
        8: 'C',
        16: 'D',
        32: 'E',
        64: 'F',
        128: 'G',
        256: 'H',
        512: 'I',
        1024: 'J',
        2048: 'K',
        4096: 'L',
        8192: 'M',
        16384: 'N',
        32768: 'O'
    }, 
    t: {
        1: '1',
        2: '2',
        3: '3',
        6: '6',
        12: '12',
        24: '24',
        48: '48',
        96: '96',
        192: '192',
        384: '384',
        768: '768'
    }
};

var _states = {
	NS: 0,
	IP: 1,
	PS: 2,
	PF: 3,
	FN: 4
};

var _sets = {
    DF: 0,
    AL: 1,
    TR: 2
};

var _user = {
	score: { c: { s: 0, m: 0, maxLevel: _symbols.ONE }, b: { s: 0, m: 0, maxLevel: _symbols.ONE } },
	game: { boost: _boosters.NONE, state: _states.IP, recentMoves: [] },
    settings: { boost: false, set: _sets.DF }
};

var _a_left = [ [], [], [], [] ]; 
    _a_top = [ [], [], [], [] ],
    _a_down = [ [], [], [], [] ],
    _a_right = [ [], [], [], [] ];

function _start(options) {
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
    
    var gridPosition = $grid.offset();
    
    $('#rightPanel').css({ top: gridPosition.top, left: gridPosition.left + gridDimensions + _settings.PADDING_SIZE });
	
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

function _init() {
	bindControls();
    
    _start({size: 4});
}

function _restart() {
    _a_left = [ [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ], [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ], [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ], [ _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY, _symbols.EMPTY ] ];
    
    setLeftArray();
    
    _user.game.state = _states.NS; 
    
    _start({size: 4});
}


function message(text) {    
    $('#message').html(text).show();
	$('#messageContainer').fadeIn('slow', function() {
        $('#messageContainer').fadeOut('slow');
    });           
}

function _welcome() {
    
}

function _chooseMode() {
    var $chooseSetContent = $('<div style="text-align: left; padding: 10px;"></div>');
	
	var $select = $('<select id="chooseModeSelect"></select>');		
	$select.append($('<option></option>', { value: 0, html: 'Default' }));
    $select.append($('<option></option>', { value: 1, html: 'Alphabets' }));
	$select.append($('<option></option>', { value: 2, html: 'Threes' }));	
    
    var $restartButton = $('<button></button>', { type: 'button', text: 'Start' });
	$restartButton.on('click', function() {
		_user.settings.set = Number($('#chooseModeSelect option:selected').val());
        $('#message').empty('');
		$('#messageContainer').hide('puff', 500);
		_restart();
	});
	
	_user.game.state = _states.PS; 
	
	$('#message').empty().append($chooseSetContent.append($('<b>Select a mode and then click on the Start button to begin.</b><br><br>')).append('Mode: ').append($select).append($restartButton).append('<br><br>Press Spacebar to return to your Game.'));
	
	$('#messageContainer').show('puff', 200);
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
    $help.append($('<li></li>', { html: 'M: Select Game Mode' }));
	$help.append($('<li></li>', { html: 'Z: Undo your last move (maximum 4 moves)' }));    
    $help.append($('<li></li>', { html: 'B: Toggle Boosts (default: off)' }));
	$help.append($('<li></li>', { html: 'R: Restart' }));
	$help.append($('<li></li>', { html: 'H: Help & Controls' }));
    $help.append($('<li></li>', { html: 'Spacebar: Pause or Resume' }));
	
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


function _saveUserGame() {
    var toSave = {};
    toSave.u = _user;
    toSave.g = _grid;    
    $.cookie(_settings.SAVE_GAME_COOKIE_NAME, JSON.stringify(toSave), { expires: 365 });
    
    message('Your Game was saved.');
}


function _loadUserGame() {
    var savedGameData = $.parseJSON($.cookie(_settings.SAVE_GAME_COOKIE_NAME));
    _user = savedGameData.u;
    _grid = savedGameData.g;
    _refresh();
    
    message('Saved Game loaded successfully.');
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


function _getHint() {
    var possibleMoves = 0;
    var simulation = _simulateMoves();
    
    var $simulationContent = $('<div style="text-align: left; padding: 10px;"></div>');
	
	var $results = $('<div></div>');		
    if(simulation.l.movement) {
        $results.append('You can move <b>Left</b>' + (simulation.l.merged > 0 ? (' - This will merge <b>' + simulation.l.merged + '</b> block(s). Your score will increase by <b>' + simulation.l.plusScore + ' point(s)</b>') : '') + '<br><br>');    
        possibleMoves++;
    }
    
    if(simulation.t.movement) {
        $results.append('You can move <b>Top</b>' + (simulation.t.merged > 0 ? (' - This will merge <b>' + simulation.t.merged + '</b> block(s). Your score will increase by <b>' + simulation.t.plusScore + ' point(s)</b>') : '') + '<br><br>');    
        possibleMoves++;
    }
    
    if(simulation.d.movement) {
        $results.append('You can move <b>Down</b>' + (simulation.d.merged > 0 ? (' - This will merge <b>' + simulation.d.merged + '</b> block(s). Your score will increase by <b>' + simulation.d.plusScore + ' point(s)</b>') : '') + '<br><br>');    
        possibleMoves++;
    }
    
    if(simulation.r.movement) {
        $results.append('You can move <b>Right</b>' + (simulation.r.merged > 0 ? (' - This will merge <b>' + simulation.r.merged + '</b> block(s). Your score will increase by <b>' + simulation.r.plusScore + ' point(s)</b>') : '') + '<br><br>');    
        possibleMoves++;
    }
    
    if(possibleMoves === 0) {
        $results.append($('No hints available')); 
    }
    	
	_user.game.state = _states.PS; 
	
	$('#message').empty().append($simulationContent.append($('<b>Hints</b><br><br>')).append($results).append('<br><br>Press Spacebar to resume your Game.'));
	
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
			} else if(event.which === _control_bindings.HINT) {
                _getHint();
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
            if(_user.settings.set === _sets.DF) {
                _toggleBoost();
            } else {
                message('Boosts are available only in Default Mode.<br>Change Game Mode by pressing <b>M</b> any time.');
            }
        } else if(event.which ===_control_bindings.MODE_SELECT) {
            _chooseMode();
        } else if(event.which ===_control_bindings.SAVE_GAME) {
            _saveUserGame();
        } else if(event.which ===_control_bindings.LOAD_GAME) {
            _loadUserGame();
        } 
	});
}

function animateBlock(blockElement, blockProperties) {
	blockElement.find('span').animate({ fontSize: '50px' }, 400, function() {
		blockElement.find('span').animate({ fontSize: '40px' }, 400);
	});
}

function getNewSymbolValue(value) {
    var newValue = _symbols.EMPTY;
    if(_user.settings.set === _sets.DF) {
        newValue = value;
    } else if(_user.settings.set === _sets.AL) {
        newValue = _symbolMappings.a[value];
    } else if(_user.settings.set === _sets.TR) {
        newValue = _symbolMappings.t[value];
    }
    
    return newValue;
}

function _refresh(newRandomBlock) {
	var $blocks = $('#grid .block');
	for(var b=0; b<_grid.length; b++) {
		var $b = $($blocks[b]);
		$b.removeClass($b.attr('class')).addClass('block block_' + b + ' level_' + _user.settings.set + '_' +  (_grid[b].s));
		if(_grid[b].s === _symbols.EMPTY) {
			$b.find('span').html('');
		} else {
			$b.find('span').html(getNewSymbolValue(_grid[b].s));
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

function getFreeGrid() {
    var freeGrid = new Array();
	for(var g=0; g<_grid.length; g++) {
		if(_grid[g].s === _symbols.EMPTY) {
			freeGrid.push(g);
		}
	}
    
    return freeGrid;
}

function getDefaultSymbol() {
    var symbol = null;
    if (_user.settings.set === _sets.DF || _user.settings.set === _sets.AL) {
       symbol = _symbols.ONE;
    } else if (_user.settings.set === _sets.TR) {
       symbol = _symbols.THREE_ONE; 
    }
    
    return symbol;
}

function _randomBlock() {
    var freeGrid = getFreeGrid();
	
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
			_grid[freeGrid[rndm]].s = getDefaultSymbol();
			
			_refresh(freeGrid[rndm]);
		} else {
		}
		
		boost();
		
		_user.game.state = _states.IP;
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

function checkMovement(arr) {
    var stateChanged = false;
    for(var i=0; i<arr.length; i++) {
        for(var j=0; j<arr.length; j++) {
            if(_user.game.recentMoves[_user.game.recentMoves.length - 1].a[i][j] !== arr[i][j]) {
                stateChanged = true;
                break;
            }
        }
        if(stateChanged) {
            break;
        }
    }
    
    return stateChanged;
}

function checkMovementAfterSimulation(originalArray, newArray) {
    var stateChanged = false;
    for(var i=0; i<originalArray.length; i++) {
        for(var j=0; j<originalArray.length; j++) {
            if(originalArray[i][j] !== newArray[i][j]) {
                stateChanged = true;
                break;
            }
        }
        if(stateChanged) {
            break;
        }
    }
    
    return stateChanged;
}

function _simulateMoves() {
    var originalLeftArray = [];
    var originalTopArray = [];
    var originalDownArray = [];
    var originalRightArray = [];
    
    var stateChanged = null;
    var afterMove = null;
    
    var simulationResults = {};
        
    // Simulate left 
    stateChanged = false;
    afterMove = null;
    getLeftArray();
    // Backup left array 
	for(var i=0; i <_a_left.length; i++) {
		var temp = new Array();
		for(var j=0; j<_a_left.length; j++) {
			temp.push(_a_left[i][j]);
		}
		originalLeftArray.push(temp);
	}
    afterMove = _processMove(_a_left, _controls.MOVE_LEFT);
    stateChanged = checkMovementAfterSimulation(originalLeftArray, _a_left);
    simulationResults.l = { movement: stateChanged, merged: afterMove.p, plusScore: afterMove.s };
    
    // Simulate Top 
    stateChanged = false;
    afterMove = null;
    getTopArray();
    // Backup Top array     
	for(var i=0; i <_a_top.length; i++) {
		var temp = new Array();
		for(var j=0; j<_a_top.length; j++) {
			temp.push(_a_top[i][j]);
		}
		originalTopArray.push(temp);
	}
    afterMove = _processMove(_a_top, _controls.MOVE_TOP);
    stateChanged = checkMovementAfterSimulation(originalTopArray, _a_top);
    simulationResults.t = { movement: stateChanged, merged: afterMove.p, plusScore: afterMove.s };
    
    // Simulate Down 
    stateChanged = false;
    afterMove = null;
    getDownArray();
    // Backup Down array     
	for(var i=0; i <_a_down.length; i++) {
		var temp = new Array();
		for(var j=0; j<_a_down.length; j++) {
			temp.push(_a_down[i][j]);
		}
		originalDownArray.push(temp);
	}
    afterMove = _processMove(_a_down, _controls.MOVE_DOWN);
    stateChanged = checkMovementAfterSimulation(originalDownArray, _a_down);
    simulationResults.d = { movement: stateChanged, merged: afterMove.p, plusScore: afterMove.s };
    
    // Simulate Right 
    stateChanged = false;
    afterMove = null;
    getRightArray();
    // Backup Right array     
	for(var i=0; i <_a_right.length; i++) {
		var temp = new Array();
		for(var j=0; j<_a_right.length; j++) {
			temp.push(_a_right[i][j]);
		}
		originalRightArray.push(temp);
	}
    afterMove = _processMove(_a_right, _controls.MOVE_RIGHT);
    stateChanged = checkMovementAfterSimulation(originalRightArray, _a_right);
    simulationResults.r = { movement: stateChanged, merged: afterMove.p, plusScore: afterMove.s };    
    
    return simulationResults;
}

function _move(where) {
    var stateChanged = false;
    var afterMove = null;
    
	if(where === _controls.MOVE_LEFT) {
        saveUserMove(_a_left, where);
        
		getLeftArray();
		
		afterMove = _processMove(_a_left, _controls.MOVE_LEFT);
		
        stateChanged = checkMovement(_a_left);
        
		setLeftArray();
	} else if(where === _controls.MOVE_TOP) {
        saveUserMove(_a_top, where);
        
		getTopArray();
		
		afterMove = _processMove(_a_top, _controls.MOVE_TOP);
        
        stateChanged = checkMovement(_a_top);
		
		setTopArray();
	} else if(where === _controls.MOVE_DOWN) {
        saveUserMove(_a_down, where);
        
		getDownArray();
		
		afterMove = _processMove(_a_down, _controls.MOVE_DOWN);
        
        stateChanged = checkMovement(_a_down);
		
		setDownArray();
	} else if(where === _controls.MOVE_RIGHT) {
        saveUserMove(_a_right, where);
        
		getRightArray();
		
		afterMove = _processMove(_a_right, _controls.MOVE_RIGHT);
        
        stateChanged = checkMovement(_a_right);
		
		setRightArray();
	}
	
    _user.score.c.s += afterMove.s;
    
    if (afterMove.s !== 0) {
        $('.scorePlus').hide();
        $('#scorePlus').html(afterMove.s).show().hide('explode', 500);
    }
        
    if(_user.game.boost !== _boosters.NONE) {
        consumedBoost();
    }
	
	_user.score.c.m++;
    
	_refresh();
	if(_user.game.state === _states.PF && afterMove.p === 0) {
		_gameOver();
	} else {
        if(getFreeGrid().length === 0) {
		  _user.game.state = _states.PF;
	    }
        
		if(stateChanged) {
            _randomBlock();
        }
	}
}

function _processMove(arr, where) {
	var plussed = 0; 
    var scorePlussed = 0;
	
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
						
                        if(_user.settings.set === _sets.DF || _user.settings.set === _sets.AL) {
                            if((arr[itr][i] === arr[itr][j]) && !(derived['' + i] || derived['' + j])) {
                                if(_user.game.boost !== _boosters.NONE) {
                                    arr[itr][i] *= _user.game.boost;								
                                } else {
                                    arr[itr][i] *= _settings.MULTIPLIER;
                                }
                                arr[itr][j] = _symbols.EMPTY;
                                derived['' + i] = true;
                                scorePlussed += arr[itr][i];
                                plussed++;							
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
                        } else if(_user.settings.set === _sets.TR) {                            
                            if((arr[itr][i] !== 2) && (arr[itr][i] === arr[itr][j]) && !(derived['' + i] || derived['' + j])) {                                
                                arr[itr][i] += arr[itr][i];
                                arr[itr][j] = _symbols.EMPTY;
                                derived['' + i] = true;
                                scorePlussed += arr[itr][i];
                                plussed++;							
                                if(_user.score.c.maxLevel < arr[itr][i]) {
                                    _user.score.c.maxLevel = arr[itr][i];
                                }
                                animateMove(itr, j, i, where, arr[itr][i]);
                            } else if((arr[itr][j] === 1 && arr[itr][i] === 2) || (arr[itr][j] === 2 && arr[itr][i] === 1) && !(derived['' + i] || derived['' + j])) {
                                arr[itr][i] += arr[itr][j];
                                arr[itr][j] = _symbols.EMPTY;
                                scorePlussed += arr[itr][i];
                                derived['' + i] = true;
                                plussed++;							
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
	}    
	
	return { p: plussed, s: scorePlussed };
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
}
