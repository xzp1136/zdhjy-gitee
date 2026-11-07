  (func (;43573;) (type 1) (param i32 i32)
    i32.const 4366854
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4366854
      i32.const 1
      i32.store8
    end
    local.get 0
    local.get 0
    call 43542
    local.set 0
    i32.const 3360788
    i32.load
    local.tee 1
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 1
      call 60460
    end
    local.get 0
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 0
      f32.const 0x1.99999ap-1 (;=0.8;)
      i32.const 0
      call 48974
    end)
