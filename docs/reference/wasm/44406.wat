  (func (;44406;) (type 3) (param i32 i32 i32) (result i32)
    (local i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4367414
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375592
      call 2180
      i32.const 4367414
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store offset=8
    i32.const 3375592
    i32.load
    local.set 3
    local.get 0
    i32.load offset=204
    local.set 0
    local.get 2
    local.get 1
    i32.store offset=12
    local.get 0
    local.get 2
    i32.const 12
    i32.add
    local.get 2
    i32.const 8
    i32.add
    local.get 3
    call 34286
    local.set 0
    local.get 2
    i32.load offset=8
    local.set 1
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 1
    i32.const 0
    local.get 0
    select)
