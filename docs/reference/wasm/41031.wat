  (func (;41031;) (type 1) (param i32 i32)
    i32.const 4365126
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3367936
      call 2180
      i32.const 4365126
      i32.const 1
      i32.store8
    end
    i32.const 3367936
    i32.load
    call 1900
    local.tee 1
    local.get 0
    i32.store offset=16
    local.get 1
    i32.const 0
    i32.store offset=8
    local.get 0
    local.get 1
    i32.const 0
    call 48887
    drop)
