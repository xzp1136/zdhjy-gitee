  (func (;43179;) (type 1) (param i32 i32)
    i32.const 4366540
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3456380
      call 2180
      i32.const 4366540
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 0
    i32.store offset=28
    local.get 0
    i32.const 1
    i32.store16 offset=24
    local.get 0
    i32.load offset=16
    i32.const 1
    i32.const 0
    call 48707
    local.get 0
    i32.load offset=16
    i32.const 3456380
    i32.load
    i32.const 0
    f32.const 0x0p+0 (;=0;)
    i32.const 0
    call 20996)
