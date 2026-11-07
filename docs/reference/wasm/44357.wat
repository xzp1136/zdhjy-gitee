  (func (;44357;) (type 1) (param i32 i32)
    local.get 0
    i32.load offset=72
    local.set 1
    local.get 0
    i32.load offset=16
    i32.const 0
    call 48736
    local.get 1
    i32.const 1
    i32.ne
    i32.const 0
    call 48833
    local.get 0
    i32.load offset=20
    i32.const 0
    call 48736
    local.get 1
    i32.const 1
    i32.eq
    local.tee 1
    i32.const 0
    call 48833
    local.get 0
    i32.load offset=24
    i32.const 0
    call 48736
    local.get 1
    i32.const 0
    call 48833)
