  (func (;41001;) (type 1) (param i32 i32)
    (local i32 f32)
    i32.const 4365104
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365104
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=72
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=72
    end
    local.get 0
    i32.load offset=76
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=76
    end
    local.get 0
    local.get 0
    call 40997
    local.get 0
    i32.load offset=52
    i32.eqz
    if  ;; label = @1
      local.get 0
      local.get 0
      local.get 0
      i32.load offset=40
      local.get 0
      call 41006
      local.tee 1
      i32.store offset=60
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 0
        local.get 0
        call 41007
        return
      end
      local.get 0
      local.get 0
      i32.load offset=60
      local.get 0
      call 41008
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 4365113
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3360788
          call 2180
          i32.const 4365113
          i32.const 1
          i32.store8
        end
        local.get 0
        i32.load offset=60
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 2
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 2
          call 60460
        end
        local.get 1
        i32.const 0
        i32.const 0
        call 48872
        i32.eqz
        if  ;; label = @3
          local.get 0
          local.get 0
          i32.load offset=60
          local.get 0
          call 41004
          local.get 0
          i32.const 0
          i32.store offset=60
        end
        local.get 0
        local.get 0
        call 41007
        return
      end
      local.get 0
      local.get 1
      local.get 0
      f32.load offset=16
      f32.const 0x0p+0 (;=0;)
      local.get 0
      call 41009
      local.get 0
      local.get 1
      local.get 0
      f32.load offset=20
      local.get 0
      call 41010
      local.set 3
      i32.const 4365105
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3371552
        call 2180
        i32.const 4365105
        i32.const 1
        i32.store8
      end
      i32.const 3371552
      i32.load
      call 1900
      local.tee 1
      local.get 0
      i32.store offset=20
      local.get 1
      i32.const 0
      i32.store offset=8
      local.get 1
      local.get 3
      f32.store offset=16
      local.get 0
      local.get 0
      local.get 1
      i32.const 0
      call 48887
      i32.store offset=72
    end)
