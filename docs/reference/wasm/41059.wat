  (func (;41059;) (type 1) (param i32 i32)
    (local i32)
    i32.const 4365156
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354340
      call 2180
      i32.const 3428464
      call 2180
      i32.const 3367928
      call 2180
      i32.const 4365156
      i32.const 1
      i32.store8
    end
    i32.const 3367928
    i32.load
    local.tee 1
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 1
      call 60460
      i32.const 3367928
      i32.load
      local.set 1
    end
    local.get 1
    i32.load offset=92
    i32.load offset=16
    local.tee 2
    i32.eqz
    if  ;; label = @1
      local.get 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3367928
        i32.load
      end
      i32.load offset=92
      i32.load
      local.set 1
      i32.const 3354340
      i32.load
      call 1900
      local.tee 2
      local.get 1
      i32.const 3428464
      i32.load
      i32.const 0
      call 38015
      i32.const 3367928
      i32.load
      i32.load offset=92
      local.get 2
      i32.store offset=16
    end
    local.get 0
    f32.const 0x1.333334p-1 (;=0.6;)
    local.get 2
    i32.const 0
    i32.const 0
    call 43909
    drop)
