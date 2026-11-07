  (func (;43781;) (type 1) (param i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4366987
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3403028
      call 2180
      i32.const 4366987
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 1
    i32.const 12
    i32.add
    i32.const 3403028
    i32.load
    call 45307
    local.get 0
    local.get 1
    i32.load offset=12
    i32.store offset=88
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
