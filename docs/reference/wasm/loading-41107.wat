  (func (;41107;) (type 1) (param i32 i32)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4365186
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3400796
      call 2180
      i32.const 4365186
      i32.const 1
      i32.store8
    end
    local.get 1
    i32.const 0
    i32.store offset=40
    local.get 1
    i32.const 0
    call 52074
    local.get 1
    local.get 1
    i64.load offset=8
    i64.store offset=28 align=4
    local.get 1
    local.get 0
    i32.store offset=36
    local.get 1
    i32.const -1
    i32.store offset=16
    local.get 1
    local.get 1
    i64.load
    i64.store offset=20 align=4
    local.get 1
    i32.const 16
    i32.add
    i32.const 4
    i32.or
    local.get 1
    i32.const 16
    i32.add
    i32.const 3400796
    i32.load
    call 45227
    local.get 1
    i32.const 48
    i32.add
    global.set 0)
