  (func (;41070;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4365166
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3376472
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3364328
      call 2180
      i32.const 4365166
      i32.const 1
      i32.store8
    end
    i32.const 3354788
    i32.load
    local.tee 0
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 0
      call 60460
    end
    i32.const 4367468
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 4367468
      i32.const 1
      i32.store8
    end
    i32.const 3354788
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3354788
      i32.load
    end
    i32.load offset=92
    i32.load
    local.set 0
    i32.const 0
    call 56046
    i32.load offset=52
    local.set 2
    i32.const 3376472
    i32.load
    local.set 3
    local.get 1
    i32.const 14
    i32.store offset=12
    local.get 2
    local.get 1
    i32.const 12
    i32.add
    local.get 1
    local.get 3
    call 34434
    local.get 0
    local.get 1
    i32.load offset=4
    i32.const 0
    call 44254
    i32.const 3364328
    i32.load
    local.tee 0
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 0
      call 60460
    end
    i32.const 4367475
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3364328
      call 2180
      i32.const 4367475
      i32.const 1
      i32.store8
    end
    i32.const 3364328
    i32.load
    local.tee 0
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 0
    else
      local.get 0
      call 60460
      i32.const 3364328
      i32.load
    end
    i32.load offset=92
    i32.load
    i32.load offset=24
    local.set 0
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 0
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      i32.const 3364328
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      i32.const 4367475
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364328
        call 2180
        i32.const 4367475
        i32.const 1
        i32.store8
      end
      i32.const 3364328
      i32.load
      local.tee 0
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 0
      else
        local.get 0
        call 60460
        i32.const 3364328
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.load offset=24
      i32.const 0
      call 56067
      f32.load offset=48
      i32.const 0
      call 42709
    end
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
