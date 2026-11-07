  (func (;43451;) (type 3) (param i32 i32 i32) (result i32)
    i32.const 4366751
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3369200
      call 2180
      i32.const 4366751
      i32.const 1
      i32.store8
    end
    i32.const 3369200
    i32.load
    call 1900
    local.tee 2
    local.get 1
    i32.store offset=20
    local.get 2
    local.get 0
    i32.store offset=16
    local.get 2
    i32.const 0
    i32.store offset=8
    local.get 2)
