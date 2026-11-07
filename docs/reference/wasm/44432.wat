  (func (;44432;) (type 0) (param i32 i32) (result i32)
    (local i32)
    i32.const 4367443
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3394712
      call 2180
      i32.const 4367443
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load8_u offset=240
    local.tee 2
    i32.eqz
    if  ;; label = @1
      local.get 0
      i32.const 1
      i32.store8 offset=240
      local.get 0
      i32.load offset=180
      i32.const 3394712
      i32.load
      call 45552
      i32.const 4367444
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3367852
        call 2180
        i32.const 4367444
        i32.const 1
        i32.store8
      end
      i32.const 3367852
      i32.load
      call 1900
      local.tee 1
      i32.const 0
      i32.const 0
      call 2298
      local.get 1
      local.get 0
      i32.store offset=16
      local.get 0
      local.get 1
      i32.const 0
      call 48887
      drop
    end
    local.get 2
    i32.eqz)
