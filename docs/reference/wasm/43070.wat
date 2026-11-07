  (func (;43070;) (type 1) (param i32 i32)
    i32.const 4366458
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3359696
      call 2180
      i32.const 3359688
      call 2180
      i32.const 3361000
      call 2180
      i32.const 3360992
      call 2180
      i32.const 3482736
      call 2180
      i32.const 4366458
      i32.const 1
      i32.store8
    end
    i32.const 3359696
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3359696
      i32.load
    end
    i32.load offset=92
    i32.load
    local.set 1
    i32.const 3359688
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3359688
      i32.load
    end
    i32.load offset=92
    local.get 1
    i32.store
    i32.const 3361000
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3361000
      i32.load
    end
    i32.load offset=92
    i32.load
    local.set 1
    i32.const 3360992
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3360992
      i32.load
    end
    i32.load offset=92
    local.get 1
    i32.store
    i32.const 0
    call 56067
    i32.const 0
    i32.store8 offset=620
    i32.const 3356428
    i32.load
    local.tee 0
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 0
      call 60460
    end
    i32.const 3482736
    i32.load
    i32.const 0
    call 55817)
